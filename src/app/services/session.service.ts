import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStatus } from '../enums/session.enum';
import { CreateSessionDto, GetSessionsQuery, UpdateSessionDto } from '../dtos/session.dto';
import { IPaginatedResponse } from '../types/shared.type';
import { ISession } from '../types/session.type';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private http: HttpClient) {}

  createSession(payload: CreateSessionDto): Observable<ISession> {
    return this.http.post<ISession>('/sessions', payload);
  }

  getSessions(query: GetSessionsQuery): Observable<IPaginatedResponse<ISession>> {
    let params = new HttpParams();

    if (query?.search) params = params.set('search', query.search.trim());
    if (query?.status !== undefined && query?.status !== null) {
      params = params.set('status', String(query.status));
    }
    if (query?.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query?.dateTo) params = params.set('dateTo', query.dateTo);
    if (query?.page) params = params.set('page', String(query.page));
    if (query?.pageSize) params = params.set('pageSize', String(query.pageSize));

    return this.http.get<IPaginatedResponse<ISession>>('/sessions', { params });
  }

  updateSession(id: number, payload: UpdateSessionDto): Observable<ISession> {
    return this.http.patch<ISession>(`/sessions/${id}`, payload);
  }
}
