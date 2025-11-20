import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IReferral } from '../types/referral.type';
import { Observable } from 'rxjs';
import { CreateReferralDto, GetReferralsQuery } from '../dtos/referral.dto';
import { IPaginatedResponse } from '../types/shared.type';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  constructor(private http: HttpClient) {}

  createReferral(payload: CreateReferralDto): Observable<IReferral> {
    return this.http.post<IReferral>('/referrals', payload);
  }

  getReferrals(query: GetReferralsQuery): Observable<IPaginatedResponse<any>> {
    let params = new HttpParams();

    if (query?.search) params = params.set('search', query.search.trim());
    if (query?.status !== undefined && query?.status !== null) {
      params = params.set('status', String(query.status));
    }
    if (query?.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query?.dateTo) params = params.set('dateTo', query.dateTo);
    if (query?.page) params = params.set('page', String(query.page));
    if (query?.pageSize) params = params.set('pageSize', String(query.pageSize));

    return this.http.get<IPaginatedResponse<any>>('/referrals', { params });
  }
}
