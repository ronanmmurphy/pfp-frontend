import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { US_STATES } from 'src/app/consts/us-states.const';
import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from 'src/app/enums/user.enum';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AddressSuggestionsResponseDto, CreateUserDto } from 'src/app/dtos/user.dto';
import { clearValidators, isFormError, isFormInvalid, passwordsMatch, setRequired, updateValidity } from 'src/app/utils/form.helper';

@Component({
  selector: 'core-auth-register',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  form!: FormGroup;
  userType: 'photographer' | 'veteran' = 'photographer';

  submitting = false;
  verifying = false;

  usStates = US_STATES;
  Eligibility = Eligibility;
  MilitaryBranchAffiliation = MilitaryBranchAffiliation;
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  suggestions: AddressSuggestionsResponseDto[] = [];
  selectedDisplay: string = '';

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        role: [UserRole.PHOTOGRAPHER, [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]],
        streetAddress1: ['', [Validators.required]],
        streetAddress2: [null],
        city: [null],
        state: [null],
        postalCode: [null],
        referredBy: [null],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        website: [null, []],
        seekingEmployment: [null, []],
        linkedinProfile: [null],
        eligibility: [null, []],
        militaryBranchAffiliation: [null, []],
        militaryETSDate: [null, []],
        certified: [null, []]
      },
      { validators: [passwordsMatch] }
    );

    this.applyDynamicValidators();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get f() {
    return this.form.controls;
  }

  setUserType(type: 'photographer' | 'veteran') {
    if (this.userType === type) return;
    this.userType = type;
    this.applyDynamicValidators();

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control) {
        control.markAsPristine();
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    });
  }

  private applyDynamicValidators() {
    clearValidators(this.form, [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'certified'
    ]);

    if (this.userType === 'photographer') {
      setRequired(this.form, ['website']);
    } else {
      setRequired(this.form, ['seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate', 'certified']);
    }

    updateValidity(this.form, ['website', 'seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate', 'certified']);
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
        error: (err) => {
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

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const role = this.userType === 'photographer' ? UserRole.PHOTOGRAPHER : UserRole.VETERAN;
    const status = this.userType === 'photographer' ? UserStatus.PENDING : UserStatus.APPROVED;

    // map to backend DTO
    const payload: CreateUserDto = {
      email: this.f['email'].value,
      password: this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      role,
      status,
      phoneNumber: this.f['phoneNumber'].value,
      streetAddress1: this.f['streetAddress1'].value,
      streetAddress2: this.f['streetAddress2'].value || undefined,
      city: this.f['city'].value || undefined,
      state: this.f['state'].value || undefined,
      postalCode: this.f['postalCode'].value || undefined,
      latitude: this.f['latitude'].value,
      longitude: this.f['longitude'].value,
      referredBy: this.f['referredBy'].value || undefined
    };

    if (role === UserRole.PHOTOGRAPHER) {
      payload.website = this.f['website'].value;
    } else {
      payload.seekingEmployment = this.f['seekingEmployment'].value;
      payload.linkedinProfile = this.f['linkedinProfile'].value || undefined;
      payload.eligibility = this.f['eligibility'].value;
      payload.militaryBranchAffiliation = this.f['militaryBranchAffiliation'].value;
      payload.militaryETSDate = this.f['militaryETSDate'].value;
    }

    this.auth
      .signup(payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (user) => {
          if (user.status === UserStatus.PENDING) {
            this.auth.logout();
            this.toastr.error('Your account is still under review.');
            this.router.navigate(['/login']);
          } else if (user.status === UserStatus.ONBOARDING) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.toastr.success('Signed up successfully!');
            this.router.navigate(['/onboarding']);
          } else if (user.status === UserStatus.APPROVED) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.toastr.success('Signed up successfully!');
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.error(err?.error?.message || 'Sign up failed');
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }
}
