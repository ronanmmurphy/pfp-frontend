import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GetAddressSuggestionsQueryDto,
  AddressSuggestionsResponseDto,
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  NearbyPhotographerQueryDto
} from '../dtos/user.dto';
import { INearbyPhotographer, IUser } from '../types/user.type';
import { IPaginatedResponse } from '../types/shared.type';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAddressSuggestions(query: GetAddressSuggestionsQueryDto) {
    return this.http.post<AddressSuggestionsResponseDto[]>('/users/address-suggestions', query);
  }

  createUser(payload: CreateUserDto): Observable<IUser> {
    return this.http.post<IUser>('/users', payload);
  }

  createUserWithFiles(formData: FormData): Observable<IUser> {
    return this.http.post<IUser>(`/users`, formData);
  }

  getUsers(query: GetUsersQueryDto): Observable<IPaginatedResponse<IUser>> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search.trim());
    if (query.role !== undefined && query.role !== null) params = params.set('role', query.role);
    if (query.status !== undefined && query.status !== null) params = params.set('status', query.status);
    params = params.set('page', query.page?.toString() ?? '1');
    params = params.set('pageSize', query.pageSize?.toString() ?? '10');

    return this.http.get<IPaginatedResponse<IUser>>('/users', { params });
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`/users/${id}`);
  }

  updateUser(id: number, payload: UpdateUserDto): Observable<IUser> {
    return this.http.patch<IUser>(`/users/${id}`, payload);
  }

  updateUserWithFiles(id: number, formData: FormData, from?: string): Observable<IUser> {
    return this.http.patch<IUser>(`/users/${id}${from ? `?from=${from}` : ''}`, formData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/users/${id}`);
  }

  getPhotographersNear(payload: NearbyPhotographerQueryDto): Observable<INearbyPhotographer[]> {
    const params = new HttpParams()
      .set('latitude', payload.latitude.toString())
      .set('longitude', payload.longitude.toString())
      .set('radius', payload.radius.toString());

    return this.http.get<any[]>('/users/photographers/nearby', { params });
  }
}
