// Angular import
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { US_STATES } from 'src/app/consts/us-states.const';
import { Eligibility, MilitaryBranchAffiliation, UserRole } from 'src/app/enums/user.enum';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

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

  suggestions: { displayName: string; latitude: number; longitude: number }[] = [];
  selectedDisplay: string = '';

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        // common
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]],
        streetAddress1: ['', [Validators.required]],
        streetAddress2: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        referredBy: [''],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        // photographer-only
        website: [''],
        // veteran-only
        seekingEmployment: [null],
        linkedinProfile: [''],
        eligibility: [null],
        militaryBranchAffiliation: [null],
        militaryETSDate: [''],
        // frontend-only checkbox
        certified: [null]
      },
      { validators: [this.passwordsMatch] }
    );

    // initialize validators for default userType
    this.applyRoleValidators();
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
    this.applyRoleValidators();

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control) {
        control.markAsPristine();
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    });
  }

  private applyRoleValidators() {
    // clear role-specific validators first
    this.clearValidators(['website', 'seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate', 'certified']);

    if (this.userType === 'photographer') {
      // photographer: website required
      this.setRequired(['website']);
      this.form.get('certified')!.setValue(false);
    } else {
      // veteran: seekingEmployment, eligibility, militaryBranchAffiliation, certified required
      this.setRequired(['seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate', 'certified']);
      this.form.get('certified')?.setValidators([Validators.requiredTrue]);
    }

    // update validity
    ['website', 'seekingEmployment', 'eligibility', 'militaryBranchAffiliation', 'militaryETSDate', 'certified'].forEach((key) =>
      this.form.get(key)?.updateValueAndValidity()
    );
  }

  private clearValidators(keys: string[]) {
    keys.forEach((k) => {
      const c = this.form.get(k);
      if (c) c.clearValidators();
    });
  }

  private setRequired(keys: string[]) {
    keys.forEach((k) => {
      const c = this.form.get(k);
      if (c) c.setValidators([Validators.required]);
    });
  }

  private passwordsMatch(group: AbstractControl) {
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('passwordConfirm')?.value;
    return password && passwordConfirm && password === passwordConfirm ? null : { passwordsMismatch: true };
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

    this.auth
      .getAddressSuggestions(addressFields)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res: { displayName: string; latitude: number; longitude: number }[]) => {
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
    const index = target.value;
    if (!index) return;

    const selected = this.suggestions[parseInt(index, 10)];
    this.form.patchValue({
      latitude: selected.latitude,
      longitude: selected.longitude
    });
    this.selectedDisplay = selected.displayName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toastr.info('Please fill out all address fields based on selected address');
  }

  // helpers to show errors in template
  invalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }
  error(name: string, key: string) {
    return this.form.get(name)?.hasError(key);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const role = this.userType === 'photographer' ? UserRole.PHOTOGRAPHER : UserRole.VETERAN;

    // map to backend DTO
    const payload: any = {
      email: this.f['email'].value,
      password: this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      role,
      phoneNumber: this.f['phoneNumber'].value,
      streetAddress1: this.f['streetAddress1'].value,
      streetAddress2: this.f['streetAddress2'].value || undefined,
      city: this.f['city'].value || undefined,
      state: this.f['state'].value || undefined,
      postalCode: this.f['postalCode'].value || undefined,
      referredBy: this.f['referredBy'].value || undefined,
      latitude: this.f['latitude'].value,
      longitude: this.f['longitude'].value
    };

    if (role === UserRole.PHOTOGRAPHER) {
      payload.website = this.f['website'].value;
    } else {
      payload.seekingEmployment = this.f['seekingEmployment'].value === true || this.f['seekingEmployment'].value === 'true';
      payload.linkedinProfile = this.f['linkedinProfile'].value || undefined;
      payload.eligibility = Number(this.f['eligibility'].value);
      payload.militaryBranchAffiliation = Number(this.f['militaryBranchAffiliation'].value);
      payload.militaryETSDate = this.f['militaryETSDate'].value || undefined;
    }

    this.auth
      .signup(payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.success('Signed up successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.toastr.error(err?.error?.message || 'Sign up failed');
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        }
      });
  }
}
