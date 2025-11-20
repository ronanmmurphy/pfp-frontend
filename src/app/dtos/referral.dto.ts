import { ReferralStatus } from '../enums/referral.enum';

export interface CreateReferralDto {
  photographerId: number;
  veteranId: number;
}

export interface GetReferralsQuery {
  search?: string;
  status?: ReferralStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
