import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionStatus } from '../enums/session.enum';

export interface AdminStats {
  veterans: number;
  photographers: number;
  onboardingPhotographers: number;
  approvedPhotographers: number;
  deniedPhotographers: number;
  sessionsCompleted: number;
  sessionsCanceled: number;
  sessionsActive: number;
}

export interface UserStats {
  sessionsCompleted: number;
  sessionsCanceled: number;
  sessionsActive: number;
}

export interface SessionRow {
  id: number;
  name: string;
  note?: string;
  status: SessionStatus;
  date: string;
  expirationDate?: string;
  photographer: any;
  veteran: any;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('/stats/admin');
  }

  getMyStats(): Observable<UserStats> {
    return this.http.get<UserStats>('/stats/me');
  }

  getRecentSessions(limit = 10): Observable<SessionRow[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<SessionRow[]>('/sessions/recent/list', { params });
  }
}
