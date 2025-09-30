import { SessionOutcome, SessionStatus } from '../enums/session.enum';

export interface CreateSessionDto {
  name: string;
  note?: string | null;
  status: SessionStatus;
  date: string;
  outcomePhotographer?: SessionOutcome | null;
  ratePhotographer?: number | null;
  photographerFeedback?: string | null;
  outcomeVeteran?: SessionOutcome | null;
  rateVeteran?: number | null;
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
