import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, filter, map, switchMap, take } from 'rxjs';
import { UserStatus } from '../enums/user.enum';
import { IUser } from '../types/user.type';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.me().pipe(
      map((user: IUser | null) => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }
        return this.checkUserStatus(user, state);
      }),
      take(1)
    );
  }

  private checkUserStatus(user: IUser, state: RouterStateSnapshot): boolean {
    if (user.status === UserStatus.PENDING) {
      this.authService.logout();
      this.toastr.error('Your account is still under review.');
      this.router.navigate(['/login']);
      return false;
    }

    if (user.status === UserStatus.ONBOARDING && state.url !== '/onboarding') {
      this.router.navigate(['/onboarding']);
      return false;
    }

    if (user.status === UserStatus.APPROVED && state.url === '/onboarding') {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
