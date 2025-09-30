import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { UserStatus } from 'src/app/enums/user.enum';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'core-auth-login',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  email = '';
  password = '';

  loading = false;

  private destroyed$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  login() {
    if (!this.email?.trim() || !this.password) {
      this.toastr.error('Please enter your email and password.');
      return;
    }

    this.loading = true;
    this.auth
      .signin({ email: this.email.trim(), password: this.password })
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (user) => {
          this.loading = false;
          if (user.status === UserStatus.ONBOARDING) {
            this.toastr.success('Logged in successfully!');
            this.router.navigate(['/onboarding']);
          } else if (user.status === UserStatus.APPROVED) {
            this.toastr.success('Logged in successfully!');
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(err?.error?.message || 'Invalid email or password.');
        }
      });
  }
}
