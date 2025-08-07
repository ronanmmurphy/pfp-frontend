// project import
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'core-auth-login',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  // public method
  SignInOptions = [
    {
      image: 'assets/images/authentication/google.svg',
      name: 'Google'
    },
    {
      image: 'assets/images/authentication/twitter.svg',
      name: 'Twitter'
    },
    {
      image: 'assets/images/authentication/facebook.svg',
      name: 'Facebook'
    }
  ];

  email: string = '';
  password: string = '';

  // Hardcoded users
  users = [
    {
      id: 1,
      name: 'Benjamin Wright',
      email: 'benjamin.wright@gmail.com',
      password: 'password123!',
      role: 1,
      address1: 'Harrison Ave',
      address2: '',
      city: 'Dallas',
      state: 'Texas',
      country: 'United States',
      postal_code: '75215'
    },
    {
      id: 2,
      name: 'James Cook',
      email: 'james.cook@gmail.com',
      password: 'password234!',
      role: 2,
      address1: 'Harrison Ave',
      address2: '',
      city: 'Dallas',
      state: 'Texas',
      country: 'United States',
      postal_code: '75215'
    }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  login(): void {
    const user = this.users.find((u) => u.email === this.email && u.password === this.password);

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigate(['/dashboard']);
    } else {
      this.toastr.error('Invalid email or password.');
    }
  }
}
