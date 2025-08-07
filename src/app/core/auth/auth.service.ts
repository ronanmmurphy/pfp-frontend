import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  // Logout function
  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
