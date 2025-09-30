import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IReferral } from '../types/referral.type';
import { Observable } from 'rxjs';
import { CreateReferralDto } from '../dtos/referral.dto';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  constructor(private http: HttpClient) {}

  createReferral(payload: CreateReferralDto): Observable<IReferral> {
    return this.http.post<IReferral>('/referrals', payload);
  }
}
