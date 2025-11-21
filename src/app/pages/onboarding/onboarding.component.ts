import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { US_STATES } from 'src/app/consts/us-states.const';
import { clearValidators, isFormError, isFormInvalid, setRequired, updateValidity } from 'src/app/utils/form.helper';
import { Subject, takeUntil, tap } from 'rxjs';
import { IUser } from 'src/app/types/user.type';
import { UpdateUserDto } from 'src/app/dtos/user.dto';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true
})
export class OnboardingComponent {
  user!: IUser;

  form!: FormGroup;
  submitting = false;

  usStates = US_STATES;
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  studioSpacePreviews: string[] = [];
  insurancePreviews: string[] = [];

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(
        tap((u) => (this.user = u)),
        takeUntil(this.destroyed$)
      )
      .subscribe();
    this.form = this.fb.group({
      mailingStreetAddress1: [null, [Validators.required]],
      mailingStreetAddress2: [null],
      mailingCity: [null],
      mailingState: [null],
      mailingPostalCode: [null],
      closestBase: [null],
      agreeToCriminalBackgroundCheck: [null, [Validators.required]],
      socialMedia: [null, [Validators.required]],
      isHomeStudio: [null, [Validators.required]],
      partOfHomeStudio: [null, []],
      isSeparateEntrance: [null, []],
      acknowledgeHomeStudioAgreement: [null, []],
      isStudioAdaAccessible: [null],
      agreeToVolunteerAgreement: [null, [Validators.required]],
      studioSpaceImages: [[]],
      proofOfInsuranceImages: [[]]
    });

    this.form.patchValue({
      ...this.user,
      studioSpaceImages: [],
      proofOfInsuranceImages: []
    });
    this.studioSpacePreviews = this.user.studioSpaceImages || [];
    this.insurancePreviews = this.user.proofOfInsuranceImages || [];

    this.form
      .get('isHomeStudio')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isHomeStudio) => {
        clearValidators(this.form, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        if (isHomeStudio) {
          setRequired(this.form, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        }
        updateValidity(this.form, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get f() {
    return this.form.controls;
  }

  onFileChange(event: any, field: 'studioSpaceImages' | 'proofOfInsuranceImages') {
    const files = event.target.files as FileList;
    const fileArray = Array.from(files);

    this.form.patchValue({ [field]: fileArray });

    // preview
    const readers = fileArray.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e: any) => resolve(e.target.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => {
      if (field === 'studioSpaceImages') {
        this.studioSpacePreviews = results;
      } else {
        this.insurancePreviews = results;
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    Object.keys(this.form.value).forEach((key) => {
      if (key !== 'studioSpaceImages' && key !== 'proofOfInsuranceImages') {
        const value = this.form.value[key];
        if (value === undefined || value === null) return;
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : '');
        } else {
          formData.append(key, value);
        }
      }
    });
    (this.form.value.studioSpaceImages || []).forEach((file: File) => {
      formData.append('studioSpaceImages', file);
    });
    (this.form.value.proofOfInsuranceImages || []).forEach((file: File) => {
      formData.append('proofOfInsuranceImages', file);
    });

    this.userService
      .updateUserWithFiles(this.user.id, formData, 'onboarding')
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.success('Saved successfully. Please wait until Admin reviews your information');
          this.submitting = false;
        },
        error: (err) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.error(err?.error?.message || 'Failed to save!');
          this.submitting = false;
        }
      });
  }
}
