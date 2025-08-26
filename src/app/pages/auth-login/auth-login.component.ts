// project import
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  login() {
    if (!this.email?.trim() || !this.password) {
      this.toastr.error('Please enter your email and password.');
      return;
    }

    this.loading = true;
    this.auth.signin(this.email.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Invalid email or password.');
      }
    });
  }
}
