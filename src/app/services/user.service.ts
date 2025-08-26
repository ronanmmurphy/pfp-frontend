import { HttpClient, HttpParams } from '@angular/common/http';
import { Eligibility, MilitaryBranchAffiliation, UserRole } from '../enums/user.enum';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserRow {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  website?: string | null;
  referredBy?: string | null;
  seekingEmployment?: boolean | null;
  linkedinProfile?: string | null;
  eligibility?: Eligibility | null;
  militaryBranchAffiliation?: MilitaryBranchAffiliation | null;
  militaryETSDate?: string | null;
  distance?: number;
}

export interface UserPageResponse<T> {
  items: T[];
  total: number;
}

export interface UserQuery {
  search?: string;
  role?: UserRole | '';
  page?: number;
  pageSize?: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  website?: string;
  referredBy?: string;
  seekingEmployment?: boolean;
  linkedinProfile?: string;
  eligibility?: Eligibility;
  militaryBranchAffiliation?: MilitaryBranchAffiliation;
  militaryETSDate?: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phoneNumber?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  website?: string;
  referredBy?: string;
  seekingEmployment?: boolean;
  linkedinProfile?: string;
  eligibility?: Eligibility;
  militaryBranchAffiliation?: MilitaryBranchAffiliation;
  militaryETSDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(query: UserQuery): Observable<UserPageResponse<UserRow>> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search.trim());
    if (query.role !== undefined && query.role !== '') {
      params = params.set('role', query.role);
    }
    params = params.set('page', String(query.page || 1));
    params = params.set('pageSize', String(query.pageSize || 10));

    return this.http.get<UserPageResponse<UserRow>>('/users', { params });
  }

  createUser(payload: CreateUserPayload): Observable<UserRow> {
    return this.http.post<UserRow>('/users', payload);
  }

  getUserById(id: number): Observable<UserRow> {
    return this.http.get<UserRow>(`/users/${id}`);
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<UserRow> {
    return this.http.patch<UserRow>(`/users/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/users/${id}`);
  }

  getPhotographersNear(userId: number, radius: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString()).set('radius', radius.toString());
    return this.http.get<any[]>('/users/photographers/nearby', { params });
  }
}
