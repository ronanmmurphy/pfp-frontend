import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { UserRole } from 'src/app/enums/user.enum';

type Tokens = { accessToken: string; refreshToken: string };

type CurrentUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  streetAddress1: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessKey = 'accessToken';
  private refreshKey = 'refreshToken';

  // Currrent User
  currentUser$: Observable<CurrentUser> = this.http.get<CurrentUser>('/auth/me');

  constructor(private http: HttpClient) {}

  getAddressSuggestions(address: any) {
    return this.http.post<{ displayName: string; latitude: number; longitude: number }[]>('/auth/address-suggestions', address);
  }

  // Sign Up
  signup(payload: any): Observable<Tokens> {
    return this.http.post<Tokens>('/auth/signup', payload).pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  // Sign In
  signin(email: string, password: string): Observable<Tokens> {
    return this.http.post<Tokens>('/auth/signin', { email, password }).pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  // Refresh Token
  refreshToken(): Observable<Tokens> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return throwError(() => new Error('Missing accessToken or refreshToken'));
    }

    return this.http.post<Tokens>('/auth/refresh', { refreshToken }).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      catchError((error) => {
        this.logout();
        return throwError(() => new Error(error?.error || 'Token refresh failed'));
      })
    );
  }

  // Sign Out
  logout(): void {
    this.clearTokens();
  }

  // ---- Token Helpers ----
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(this.accessKey, tokens.accessToken);
    localStorage.setItem(this.refreshKey, tokens.refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }
}
