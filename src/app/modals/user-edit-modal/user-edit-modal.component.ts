import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from 'src/app/enums/user.enum';
import { US_STATES } from 'src/app/consts/us-states.const';
import { Subject, takeUntil } from 'rxjs';
import { AddressSuggestionsResponseDto, CreateUserDto, UpdateUserDto } from 'src/app/dtos/user.dto';
import { clearValidators, isFormError, isFormInvalid, passwordsMatch, setRequired, updateValidity } from 'src/app/utils/form.helper';
import { IUser } from 'src/app/types/user.type';

@Component({
  selector: 'app-user-edit-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
  standalone: true
})
export class UserEditModalComponent {
  @Input() user: CreateUserDto | IUser = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.PHOTOGRAPHER,
    status: UserStatus.PENDING,
    phoneNumber: '',
    streetAddress1: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    openToReferrals: true
  };
  @Input() isEdit = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  verifying = false;

  UserRole = UserRole;
  UserStatus = UserStatus;
  Eligibility = Eligibility;
  MilitaryBranchAffiliation = MilitaryBranchAffiliation;
  usStates = US_STATES;
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  studioSpacePreviews: string[] = [];
  insurancePreviews: string[] = [];

  suggestions: AddressSuggestionsResponseDto[] = [];
  selectedDisplay: string = '';

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        role: [UserRole.PHOTOGRAPHER, [Validators.required]],
        status: [UserStatus.PENDING, [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', this.isEdit ? [] : [Validators.required]],
        phoneNumber: ['', [Validators.required]],
        streetAddress1: ['', [Validators.required]],
        streetAddress2: [null],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        referredBy: [null],
        reasonForDenying: [null, []],
        // Photographer
        website: [null, []],
        openToReferrals: [true, Validators.required],
        // Photographer Onboarding
        mailingStreetAddress1: [null, []],
        mailingStreetAddress2: [null],
        mailingCity: [null],
        mailingState: [null],
        mailingPostalCode: [null],
        closestBase: [null, []],
        agreeToCriminalBackgroundCheck: [null, []],
        socialMedia: [null, []],
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
      },
      { validators: this.isEdit ? [] : [passwordsMatch] }
    );

    this.form.patchValue({
      ...this.user,
      password: '',
      passwordConfirm: '',
      studioSpaceImages: [],
      proofOfInsuranceImages: []
    });
    this.applyDynamicValidators();
    this.studioSpacePreviews = this.isEdit ? (this.user as IUser).studioSpaceImages || [] : [];
    this.insurancePreviews = this.isEdit ? (this.user as IUser).proofOfInsuranceImages || [] : [];

    this.form
      .get('role')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((role) => {
        this.applyDynamicValidators();
        Object.keys(this.form.controls).forEach((key) => {
          const control = this.form.get(key);
          if (control) {
            control.markAsPristine();
            control.markAsUntouched();
            control.updateValueAndValidity();
          }
        });
        const status = role === UserRole.PHOTOGRAPHER ? UserStatus.PENDING : UserStatus.APPROVED;
        this.form.get('status')?.setValue(status);
      });

    this.form
      .get('status')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((status) => {
        clearValidators(this.form, [
          'mailingStreetAddress1',
          'closestBase',
          'agreeToCriminalBackgroundCheck',
          'socialMedia',
          'isHomeStudio',
          'partOfHomeStudio',
          'isSeparateEntrance',
          'acknowledgeHomeStudioAgreement',
          'agreeToVolunteerAgreement'
        ]);
        if (status === UserStatus.APPROVED && this.f['role'].value === UserRole.PHOTOGRAPHER) {
          setRequired(this.form, [
            'mailingStreetAddress1',
            'closestBase',
            'agreeToCriminalBackgroundCheck',
            'socialMedia',
            'isHomeStudio',
            'agreeToVolunteerAgreement'
          ]);
        }
        updateValidity(this.form, [
          'mailingStreetAddress1',
          'closestBase',
          'agreeToCriminalBackgroundCheck',
          'socialMedia',
          'isHomeStudio',
          'partOfHomeStudio',
          'isSeparateEntrance',
          'acknowledgeHomeStudioAgreement',
          'agreeToVolunteerAgreement'
        ]);
      });

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

  private applyDynamicValidators() {
    const role = this.form.get('role')?.value;
    const status = this.form.get('status')?.value;
    // Clear all role-specific validators
    clearValidators(this.form, [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'reasonForDenying',
      'mailingStreetAddress1',
      'closestBase',
      'agreeToCriminalBackgroundCheck',
      'socialMedia',
      'isHomeStudio',
      'partOfHomeStudio',
      'isSeparateEntrance',
      'acknowledgeHomeStudioAgreement',
      'agreeToVolunteerAgreement'
    ]);

    if (role === UserRole.ADMIN) {
      // No additional fields required for ADMIN
    } else if (role === UserRole.PHOTOGRAPHER) {
      setRequired(this.form, ['website']);
      if (status === UserStatus.APPROVED) {
        setRequired(this.form, [
          'mailingStreetAddress1',
          'closestBase',
          'agreeToCriminalBackgroundCheck',
          'socialMedia',
          'isHomeStudio',
          'agreeToVolunteerAgreement'
        ]);
        if (this.form.get('isHomeStudio')?.value) {
          setRequired(this.form, ['partOfHomeStudio', 'isSeparateEntrance', 'acknowledgeHomeStudioAgreement']);
        }
      }
    } else if (role === UserRole.VETERAN) {
      setRequired(this.form, ['seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate']);
    }

    if (status === UserStatus.DENIED) {
      setRequired(this.form, ['reasonForDenying']);
    }

    // Update validity for all role-specific fields
    updateValidity(this.form, [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'reasonForDenying',
      'mailingStreetAddress1',
      'closestBase',
      'agreeToCriminalBackgroundCheck',
      'socialMedia',
      'isHomeStudio',
      'partOfHomeStudio',
      'isSeparateEntrance',
      'acknowledgeHomeStudioAgreement',
      'agreeToVolunteerAgreement'
    ]);
  }

  verifyAddress() {
    const addressFields = {
      streetAddress1: this.form.get('streetAddress1')?.value,
      streetAddress2: this.form.get('streetAddress2')?.value,
      city: this.form.get('city')?.value,
      state: this.form.get('state')?.value,
      postalCode: this.form.get('postalCode')?.value
    };

    if (!addressFields.streetAddress1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.toastr.error('Please enter at least the street address.');
      return;
    }

    this.verifying = true;

    this.userService
      .getAddressSuggestions(addressFields)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res: AddressSuggestionsResponseDto[]) => {
          this.suggestions = res;
          this.selectedDisplay = ''; // Reset selected
          this.form.patchValue({ latitude: null, longitude: null }); // Reset lat/long
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
    this.form.patchValue({
      latitude: selected.latitude,
      longitude: selected.longitude
    });
    this.selectedDisplay = selected.displayName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toastr.info('Please fill out all address fields based on selected address');
  }

  saveUser(): void {
    if (this.form.invalid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.form.markAllAsTouched();
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    let skipFields = ['studioSpaceImages', 'proofOfInsuranceImages', 'passwordConfirm'];
    this.isEdit ? skipFields.push('password') : null;

    Object.keys(this.form.value).forEach((key) => {
      const value = this.form.value[key];

      if (value === undefined || value === null) return;

      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : '');
      } else if (!skipFields.includes(key)) {
        formData.append(key, value);
      }
    });

    (this.form.value.studioSpaceImages || []).forEach((file: File) => {
      formData.append('studioSpaceImages', file);
    });
    (this.form.value.proofOfInsuranceImages || []).forEach((file: File) => {
      formData.append('proofOfInsuranceImages', file);
    });

    const request =
      this.isEdit && 'id' in this.user
        ? this.userService.updateUserWithFiles(this.user.id, formData)
        : this.userService.createUserWithFiles(formData);

    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.toastr.success(this.isEdit ? 'User updated successfully.' : 'User created successfully.');
        this.submitting = false;
        this.save.emit();
      },
      error: (err) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.toastr.error(err?.error?.message || (this.isEdit ? 'Failed to update user.' : 'Failed to create user.'));
        this.submitting = false;
      }
    });
  }

  cancelUser(): void {
    this.cancel.emit();
  }
}
