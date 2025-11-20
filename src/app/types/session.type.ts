import { SessionOutcome, SessionStatus } from '../enums/session.enum';

export interface ISession {
  id: number;
  name: string;
  note?: string | null;
  status: SessionStatus;
  date: string;
  outcomePhotographer?: SessionOutcome | null;
  otherOutcomePhotographer?: string | null;
  ratePhotographer?: number | null;
  photographerFeedback?: string | null;
  outcomeVeteran?: SessionOutcome | null;
  otherOutcomeVeteran?: string | null;
  rateVeteran?: number | null;
  veteranFeedback?: string | null;
  photographer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  veteran: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
}
