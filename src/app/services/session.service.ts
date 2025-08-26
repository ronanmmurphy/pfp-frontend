import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStatus } from '../enums/session.enum';

export interface SessionQuery {
  search?: string;
  status?: SessionStatus | '';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface SessionListItem {
  id: number;
  name: string;
  note?: string;
  date: string;
  expirationDate?: string;
  status: SessionStatus;
  photographer: any;
  veteran: any;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private http: HttpClient) {}

  getSessions(paramsIn: SessionQuery): Observable<PageResponse<SessionListItem>> {
    let params = new HttpParams();
    if (paramsIn.search) params = params.set('search', paramsIn.search.trim());
    if (paramsIn.status !== undefined && paramsIn.status !== '') {
      params = params.set('status', String(paramsIn.status));
    }
    if (paramsIn.dateFrom) params = params.set('dateFrom', paramsIn.dateFrom);
    if (paramsIn.dateTo) params = params.set('dateTo', paramsIn.dateTo);
    if (paramsIn.page) params = params.set('page', String(paramsIn.page));
    if (paramsIn.pageSize) params = params.set('pageSize', String(paramsIn.pageSize));

    return this.http.get<PageResponse<SessionListItem>>('/sessions', { params });
  }

  createSession(payload: any): Observable<any> {
    return this.http.post<any>('/sessions', payload);
  }

  updateSession(id: number, update: { status?: SessionStatus; date?: string }): Observable<any> {
    return this.http.patch(`/sessions/${id}`, update);
  }
}
