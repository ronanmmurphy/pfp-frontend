import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CreateUserPayload, UpdateUserPayload, UserRow, UserService } from 'src/app/services/user.service';
import { Eligibility, MilitaryBranchAffiliation, UserRole } from 'src/app/enums/user.enum';
import { US_STATES } from 'src/app/consts/us-states.const';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-edit-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
  standalone: true
})
export class UserEditModalComponent {
  @Input() user: CreateUserPayload | UpdateUserPayload = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.VETERAN,
    phoneNumber: '',
    streetAddress1: '',
    streetAddress2: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    website: '',
    referredBy: '',
    seekingEmployment: false,
    linkedinProfile: '',
    eligibility: Eligibility.TRANSITIONING_SERVICE_MEMBER,
    militaryBranchAffiliation: MilitaryBranchAffiliation.US_AIR_FORCE,
    militaryETSDate: ''
  };
  @Input() isEdit = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  verifying = false;

  UserRole = UserRole;
  Eligibility = Eligibility;
  MilitaryBranchAffiliation = MilitaryBranchAffiliation;
  usStates = US_STATES;

  suggestions: { displayName: string; latitude: number; longitude: number }[] = [];
  selectedDisplay: string = '';

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        role: [UserRole.PHOTOGRAPHER, [Validators.required]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', this.isEdit ? [] : [Validators.required]],
        phoneNumber: ['', [Validators.required]],
        streetAddress1: ['', [Validators.required]],
        streetAddress2: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        referredBy: [''],
        latitude: [null, [Validators.required]],
        longitude: [null, [Validators.required]],
        website: [''],
        seekingEmployment: [null],
        linkedinProfile: [''],
        eligibility: [null],
        militaryBranchAffiliation: [null],
        militaryETSDate: ['']
      },
      { validators: this.isEdit ? [] : [this.passwordsMatch] }
    );
    this.applyRoleValidators();
    this.form.patchValue({
      ...this.user,
      password: '',
      passwordConfirm: ''
    });

    this.form.get('role')?.valueChanges.subscribe(() => {
      this.applyRoleValidators();
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.markAsPristine();
          control.markAsUntouched();
          control.updateValueAndValidity();
        }
      });
    });
  }

  get f() {
    return this.form.controls;
  }

  private clearValidators(keys: string[]) {
    keys.forEach((k) => {
      const c = this.form.get(k);
      if (c) c.clearValidators();
    });
  }

  private applyRoleValidators() {
    const role = this.form.get('role')?.value;
    // Clear all role-specific validators
    this.clearValidators([
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'phoneNumber',
      'streetAddress1',
      'latitude',
      'longitude'
    ]);

    if (role === UserRole.ADMIN) {
      // No additional fields required for ADMIN
    } else if (role === UserRole.PHOTOGRAPHER) {
      this.setRequired(['website', 'phoneNumber', 'streetAddress1', 'latitude', 'longitude']);
    } else if (role === UserRole.VETERAN) {
      this.setRequired([
        'seekingEmployment',
        'eligibility',
        'militaryBranchAffiliation',
        'militaryETSDate',
        'phoneNumber',
        'streetAddress1',
        'latitude',
        'longitude'
      ]);
    }

    // Update validity for all role-specific fields
    [
      'website',
      'seekingEmployment',
      'eligibility',
      'militaryBranchAffiliation',
      'militaryETSDate',
      'phoneNumber',
      'streetAddress1',
      'latitude',
      'longitude'
    ].forEach((key) => this.form.get(key)?.updateValueAndValidity());
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

  invalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  error(name: string, key: string) {
    return this.form.get(name)?.hasError(key);
  }

  saveUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload: CreateUserPayload | UpdateUserPayload = {
      email: this.f['email'].value,
      password: this.isEdit ? undefined : this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      role: this.f['role'].value,
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

    if (this.f['role'].value === UserRole.PHOTOGRAPHER) {
      payload.website = this.f['website'].value || undefined;
    } else if (this.f['role'].value === UserRole.VETERAN) {
      payload.seekingEmployment = this.f['seekingEmployment'].value;
      payload.linkedinProfile = this.f['linkedinProfile'].value || undefined;
      payload.eligibility = this.f['eligibility'].value;
      payload.militaryBranchAffiliation = this.f['militaryBranchAffiliation'].value;
      payload.militaryETSDate = this.f['militaryETSDate'].value;
    }

    const request =
      this.isEdit && (this.user as UserRow).id
        ? this.userService.updateUser((this.user as UserRow).id, payload as UpdateUserPayload)
        : this.userService.createUser(payload as CreateUserPayload);

    request.subscribe({
      next: () => {
        this.toastr.success(this.isEdit ? 'User updated successfully.' : 'User created successfully.');
        this.submitting = false;
        this.save.emit();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || (this.isEdit ? 'Failed to update user.' : 'Failed to create user.'));
        this.submitting = false;
      }
    });
  }

  cancelUser(): void {
    this.cancel.emit();
  }
}
