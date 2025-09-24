import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ChangePasswordDto } from 'src/app/dtos/auth.dto';
import { AuthService } from 'src/app/services/auth.service';
import { isFormError, isFormInvalid, passwordsMatch } from 'src/app/utils/form.helper';

@Component({
  selector: 'app-password-change-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './password-change-modal.component.html',
  styleUrls: ['./password-change-modal.component.scss'],
  standalone: true
})
export class PasswordChangeModalComponent {
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;

  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required]
      },
      { validators: [passwordsMatch] }
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get f() {
    return this.form.controls;
  }

  savePassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const payload: ChangePasswordDto = {
      password: this.f['password'].value
    };

    this.authService
      .changePassword(payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.toastr.success('Password updated successfully.');
          this.submitting = false;
          this.save.emit();
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to update password.');
          this.submitting = false;
        }
      });
  }

  cancelPassword(): void {
    this.cancel.emit();
  }
}
