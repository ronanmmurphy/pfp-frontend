import { SessionStatus } from '../enums/session.enum';

export interface CreateSessionDto {
  name: string;
  note?: string | null;
  status: SessionStatus;
  date: string;
  expirationDate?: string | null;
  photographerFeedback?: string | null;
  veteranFeedback?: string | null;
  photographerId: number;
  veteranId: number;
}

export interface GetSessionsQuery {
  search?: string;
  status?: SessionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export type UpdateSessionDto = Partial<CreateSessionDto>;
