import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, of, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { IUser } from '../types/user.type';
import { AuthResponseDto, ChangePasswordDto, SignInDto } from '../dtos/auth.dto';
import { CreateUserDto } from '../dtos/user.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessKey = 'accessToken';
  private refreshKey = 'refreshToken';

  // Currrent User
  // currentUser$: Observable<IUser> = this.http.get<IUser>('/auth/me');
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private destroy$ = new Subject<void>();
  private isInitialized = false;

  constructor(private http: HttpClient) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  me(): Observable<IUser | null> {
    if (this.isInitialized) {
      return this.currentUser$.pipe(takeUntil(this.destroy$));
    }

    const token = localStorage.getItem(this.accessKey);
    if (!token) {
      this.isInitialized = true;
      return of(null);
    }

    return this.http.get<IUser>('/auth/me').pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isInitialized = true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.logout();
        this.isInitialized = true;
        return of(null);
      }),
      takeUntil(this.destroy$)
    );
  }

  refreshCurrentUser(): Observable<IUser | null> {
    return this.http.get<IUser>('/auth/me').pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((err) => {
        this.logout();
        return of(null);
      })
    );
  }

  // Sign Up
  signup(payload: CreateUserDto): Observable<IUser> {
    return this.http.post<AuthResponseDto>('/auth/signup', payload).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      switchMap(() => this.http.get<IUser>('/auth/me')),
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isInitialized = true;
      })
    );
  }

  // Sign In
  signin(payload: SignInDto): Observable<IUser> {
    return this.http.post<AuthResponseDto>('/auth/signin', payload).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      switchMap(() => this.http.get<IUser>('/auth/me')),
      tap((user) => {
        this.currentUserSubject.next(user);
        this.isInitialized = true;
      })
    );
  }

  // Refresh Token
  refreshToken(): Observable<AuthResponseDto> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return throwError(() => new Error('Missing accessToken or refreshToken'));
    }

    return this.http.post<AuthResponseDto>('/auth/refresh', { refreshToken }).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      catchError((error) => {
        this.logout();
        return throwError(() => new Error(error?.error || 'Token refresh failed'));
      })
    );
  }

  // Sign Out
  logout(): void {
    this.currentUserSubject.next(null);
    this.clearTokens();
    this.isInitialized = false;
  }

  // Change Password
  changePassword(payload: ChangePasswordDto) {
    return this.http.patch('/auth/change-password', payload);
  }

  // ---- Token Helpers ----
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map((user) => !!user),
      takeUntil(this.destroy$)
    );
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

  private storeTokens(tokens: AuthResponseDto) {
    localStorage.setItem(this.accessKey, tokens.accessToken);
    localStorage.setItem(this.refreshKey, tokens.refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }
}
