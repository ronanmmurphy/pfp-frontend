import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { IUser } from 'src/app/types/user.type';
import { AddressSuggestionsResponseDto, UpdateUserDto } from 'src/app/dtos/user.dto';
import { US_STATES } from 'src/app/consts/us-states.const';
import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from 'src/app/enums/user.enum';
import { AuthService } from 'src/app/services/auth.service';
import { clearValidators, isFormError, isFormInvalid, passwordsMatch, setRequired, updateValidity } from 'src/app/utils/form.helper';
import { UserService } from 'src/app/services/user.service';
import { PasswordChangeModalComponent } from 'src/app/modals/password-change-modal/password-change-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgIf, NgFor, NgClass, PasswordChangeModalComponent]
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser$!: Observable<IUser | null>;
  userId: number | null = null;

  userForm: FormGroup;
  passwordForm: FormGroup;
  submitting = false;
  verifying = false;

  suggestions: AddressSuggestionsResponseDto[] = [];
  selectedDisplay: string | null = null;

  usStates = US_STATES;
  UserRole = UserRole;
  UserStatus = UserStatus;
  Eligibility = Eligibility;
  MilitaryBranchAffiliation = MilitaryBranchAffiliation;
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  studioSpacePreviews: string[] = [];
  insurancePreviews: string[] = [];

  private destroyed$ = new Subject<void>();

  showModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      role: [{ value: null, disabled: true }, Validators.required],
      status: [{ value: null, disabled: true }, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      streetAddress1: ['', Validators.required],
      streetAddress2: [null],
      city: [null],
      state: [null],
      postalCode: [null],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      referredBy: [null],
      // Photographer
      website: [null, []],
      maxSessionsPerMonth: [null],
      // Photographer Onboarding
      mailingStreetAddress1: [null, []],
      mailingStreetAddress2: [null],
      mailingCity: [null],
      mailingState: [null],
      mailingPostalCode: [null],
      closestBase: [null, []],
      agreeToCriminalBackgroundCheck: [null, []],
      xLink: [null, []],
      facebookLink: [null, []],
      linkedinLink: [null, []],
      instagramLink: [null, []],
      isHomeStudio: [null, []],
      partOfHomeStudio: [null, []],
      isSeparateEntrance: [null, []],
      acknowledgeHomeStudioAgreement: [null, []],
      isStudioAdaAccessible: [null],
      agreeToVolunteerAgreement: [null, []],
      studioSpaceImages: [[]],
      proofOfInsuranceImages: [[]],
      // Veteran
      seekingEmployment: [null, []],
      linkedinProfile: [null],
      eligibility: [null, []],
      militaryBranchAffiliation: [null, []],
      militaryETSDate: [null, []]
    });

    this.passwordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required]
      },
      { validators: passwordsMatch }
    );
  }

  ngOnInit() {
    this.currentUser$ = this.authService.me().pipe(
      tap((user) => {
        if (user) {
          this.userId = user.id;
          this.userForm.patchValue({
            ...user,
            studioSpaceImages: [],
            proofOfInsuranceImages: []
          });
          this.userForm.get('role')?.disable();
          this.userForm.get('status')?.disable();
          this.applyDynamicValidators();
          this.studioSpacePreviews = user.studioSpaceImages || [];
          this.insurancePreviews = user.proofOfInsuranceImages || [];
        }
      }),
      takeUntil(this.destroyed$)
    );

    this.userForm
      .get('isHomeStudio')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isHomeStudio) => {
        clearValidators(this.userForm, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        if (isHomeStudio) {
          setRequired(this.userForm, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        }
        updateValidity(this.userForm, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get f() {
    return this.userForm.controls;
  }

  get pf() {
    return this.passwordForm.controls;
  }

  onFileChange(event: any, field: 'studioSpaceImages' | 'proofOfInsuranceImages') {
    const files = event.target.files as FileList;
    const fileArray = Array.from(files);

    this.userForm.patchValue({ [field]: fileArray });

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

  private applyDynamicValidators() {
    const role = this.userForm.get('role')?.value;
    const status = this.userForm.get('status')?.value;
    // Clear all role-specific validators
    clearValidators(this.userForm, [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'mailingStreetAddress1',
      'closestBase',
      'agreeToCriminalBackgroundCheck',
      'xLink',
      'facebookLink',
      'linkedinLink',
      'instagramLink',
      'isHomeStudio',
      'partOfHomeStudio',
      'isSeparateEntrance',
      'acknowledgeHomeStudioAgreement',
      'agreeToVolunteerAgreement'
    ]);

    if (role === UserRole.ADMIN) {
      // No additional fields required for ADMIN
    } else if (role === UserRole.PHOTOGRAPHER) {
      setRequired(this.userForm, ['website']);
      if (status === UserStatus.APPROVED) {
        setRequired(this.userForm, [
          'mailingStreetAddress1',
          'closestBase',
          'agreeToCriminalBackgroundCheck',
          'xLink',
          'facebookLink',
          'linkedinLink',
          'instagramLink',
          'isHomeStudio',
          'agreeToVolunteerAgreement'
        ]);
        if (this.userForm.get('isHomeStudio')?.value) {
          setRequired(this.userForm, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        }
      }
    } else if (role === UserRole.VETERAN) {
      setRequired(this.userForm, ['seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate']);
    }

    // Update validity for all role-specific fields
    updateValidity(this.userForm, [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'mailingStreetAddress1',
      'closestBase',
      'agreeToCriminalBackgroundCheck',
      'xLink',
      'facebookLink',
      'linkedinLink',
      'instagramLink',
      'isHomeStudio',
      'partOfHomeStudio',
      'isSeparateEntrance',
      'acknowledgeHomeStudioAgreement',
      'agreeToVolunteerAgreement'
    ]);
  }

  verifyAddress() {
    this.verifying = true;
    const addressFields = {
      streetAddress1: this.f['streetAddress1'].value,
      streetAddress2: this.f['streetAddress2'].value,
      city: this.f['city'].value,
      state: this.f['state'].value,
      postalCode: this.f['postalCode'].value
    };

    if (!addressFields.streetAddress1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.toastr.error('Please enter at least the street address.');
      return;
    }

    this.userService
      .getAddressSuggestions(addressFields)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res: AddressSuggestionsResponseDto[]) => {
          this.suggestions = res;
          this.selectedDisplay = ''; // Reset selected
          this.userForm.patchValue({ latitude: null, longitude: null }); // Reset lat/long
          this.verifying = false;
          if (res.length === 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.toastr.warning('No addresses found. Please check your input and try again.');
          }
        },
        error: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.error('Failed to fetch address suggestions. Please try again.');
          this.verifying = false;
        }
      });
  }

  selectAddress(event: Event) {
    const target = event.target as HTMLSelectElement;
    const index = parseInt(target.value, 10);
    if (isNaN(index)) return;

    const selected = this.suggestions[index];
    this.userForm.patchValue({
      latitude: selected.latitude,
      longitude: selected.longitude
    });
    this.selectedDisplay = selected.displayName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toastr.info('Please fill out all address fields based on selected address');
  }

  saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Please fill out all required fields correctly.');
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    const skipFields = ['studioSpaceImages', 'proofOfInsuranceImages'];

    Object.keys(this.userForm.value).forEach((key) => {
      const value = this.userForm.value[key];

      if (value === undefined || value === null) return;

      if (!skipFields.includes(key)) {
        formData.append(key, value);
      }
    });

    (this.userForm.value.studioSpaceImages || []).forEach((file: File) => {
      formData.append('studioSpaceImages', file);
    });
    (this.userForm.value.proofOfInsuranceImages || []).forEach((file: File) => {
      formData.append('proofOfInsuranceImages', file);
    });

    this.userService
      .updateUserWithFiles(this.userId, formData)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.success('Profile updated successfully');
          this.submitting = false;
        },
        error: (err) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.error(err?.error?.message || 'Failed to update profile');
          this.submitting = false;
        }
      });
  }

  onModalSave(): void {
    this.showModal = false;
  }

  onModalCancel(): void {
    this.showModal = false;
  }
}
