import { SessionStatus } from '../enums/session.enum';

export interface ISession {
  id: number;
  name: string;
  note?: string | null;
  status: SessionStatus;
  date: string;
  expirationDate?: string | null;
  photographerFeedback?: string | null;
  veteranFeedback?: string | null;
  photographer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;
  veteran: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress1: string;
    streetAddress2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;
}
