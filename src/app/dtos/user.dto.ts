import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from '../enums/user.enum';

export interface GetAddressSuggestionsQueryDto {
  streetAddress1: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface AddressSuggestionsResponseDto {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface GetUsersQueryDto {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  referredBy?: string;
  reasonForDenying?: string;
  // Photographer
  website?: string;
  openToReferrals: boolean;
  // Photographer Onboarding
  mailingStreetAddress1?: string;
  mailingStreetAddress2?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingPostalCode?: string;
  closestBase?: string;
  agreeToCriminalBackgroundCheck?: boolean;
  socialMedia?: string;
  isHomeStudio?: boolean;
  partOfHomeStudio?: string;
  isSeparateEntrance?: boolean;
  acknowledgeHomeStudioAgreement?: boolean;
  isStudioAdaAccessible?: boolean;
  agreeToVolunteerAgreement?: boolean;
  // Veteran
  seekingEmployment?: boolean;
  linkedinProfile?: string;
  eligibility?: Eligibility;
  militaryBranchAffiliation?: MilitaryBranchAffiliation;
  militaryETSDate?: string;
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>>;

export interface NearbyPhotographerQueryDto {
  latitude: number;
  longitude: number;
  radius: number;
}
