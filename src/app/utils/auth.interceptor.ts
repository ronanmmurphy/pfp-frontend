import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = localStorage.getItem('accessToken');
  const apiUrl = environment.apiUrl;

  // Define APIs that don't require authentication
  const excludedUrls = ['/auth/signin', '/auth/signup', '/auth/refresh', '/auth/address-suggestions'];

  const isExcluded = excludedUrls.some((path) => path === req.url);

  // Ensure the request URL is absolute by adding the base API URL
  let modifiedUrl = req.url;
  if (!req.url.startsWith('http')) {
    modifiedUrl = `${apiUrl}${req.url}`;
  }

  // If the request requires authentication, attach Authorization header
  let authReq = req.clone({ url: modifiedUrl });

  // Check if the request URL matches an excluded API
  if (accessToken && !isExcluded) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !authReq.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          catchError((err) => {
            authService.logout();
            return throwError(() => err);
          }),

          switchMap((newTokens) => {
            const newToken = newTokens.accessToken;
            const retryReq = authReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq).pipe(
              catchError((retryError) => {
                return throwError(() => retryError);
              })
            );
          })
        );
      }

      return throwError(() => error);
    })
  );
};
