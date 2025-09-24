import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from '../enums/user.enum';

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  referredBy?: string | null;
  reasonForDenying?: string | null;
  // Photographer
  website?: string | null;
  maxSessionsPerMonth?: number;
  // Photographer Onboarding
  mailingStreetAddress1?: string | null;
  mailingStreetAddress2?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingPostalCode?: string | null;
  closestBase?: string | null;
  agreeToCriminalBackgroundCheck?: boolean | null;
  xLink?: string | null;
  facebookLink?: string | null;
  linkedinLink?: string | null;
  instagramLink?: string | null;
  isHomeStudio?: boolean | null;
  partOfHomeStudio?: string | null;
  isSeparateEntrance?: boolean | null;
  acknowledgeHomeStudioAgreement?: boolean | null;
  isStudioAdaAccessible?: boolean | null;
  agreeToVolunteerAgreement?: boolean | null;
  studioSpaceImages?: string[];
  proofOfInsuranceImages?: string[];
  // Veteran
  seekingEmployment?: boolean | null;
  linkedinProfile?: string | null;
  eligibility?: Eligibility | null;
  militaryBranchAffiliation?: MilitaryBranchAffiliation | null;
  militaryETSDate?: string | null;
}

export interface INearbyPhotographer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  latitude: number;
  longitude: number;
  distance: number;
}
