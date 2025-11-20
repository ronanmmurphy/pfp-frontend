import { Eligibility, MilitaryBranchAffiliation, UserRole, UserStatus } from '../enums/user.enum';

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.PHOTOGRAPHER]: 'Photographer',
  [UserRole.VETERAN]: 'Client'
};

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ONBOARDING]: 'Onboarding',
  [UserStatus.APPROVED]: 'Approved',
  [UserStatus.DENIED]: 'Denied',
  [UserStatus.PENDING]: 'Pending'
};

export const EligibilityLabel: Record<Eligibility, string> = {
  [Eligibility.TRANSITIONING_SERVICE_MEMBER]: 'Transitioning Service Member',
  [Eligibility.GOLD_STAR_FAMILY_MEMBER]: 'Gold Star Family Member',
  [Eligibility.MILITARY_SPOUSE]: 'Military Spouse'
};

export const MilitaryBranchAffiliationLabel: Record<MilitaryBranchAffiliation, string> = {
  [MilitaryBranchAffiliation.US_AIR_FORCE]: 'US Air Force',
  [MilitaryBranchAffiliation.US_ARMY]: 'US Army',
  [MilitaryBranchAffiliation.US_COAST_GUARD]: 'US Cost Guard',
  [MilitaryBranchAffiliation.US_NAVY]: 'US Navy',
  [MilitaryBranchAffiliation.US_MARINE_CORPS]: 'US Marine Corps',
  [MilitaryBranchAffiliation.US_SPACE_FORCE]: 'US Space Force'
};

export function getFullName(firstName: string, lastName: string) {
  return firstName + ' ' + lastName;
}

export function getRoleText(role: UserRole) {
  return UserRoleLabel[role] ?? 'Unknown';
}

export function getUserStatusText(status: UserStatus) {
  return UserStatusLabel[status] ?? 'Unknown';
}

export function getLocationText(streetAddress1: string, city: string, state: string, postalCode: string, streetAddress2?: string) {
  const streetAddress = streetAddress2 ? streetAddress1 + ', ' + streetAddress2 : streetAddress1;
  return streetAddress + ', ' + city + ', ' + state + ', ' + postalCode;
}

export function getSeekingEmploymentText(seekingEmployment: boolean | undefined | null) {
  if (seekingEmployment === true) {
    return 'Yes';
  } else if (seekingEmployment === false) {
    return 'No';
  }
  return '';
}

export function getEligibilityText(eligibility: Eligibility) {
  return EligibilityLabel[eligibility] ?? '';
}

export function getMilitaryBranchAffiliationText(militaryBranchAffiliation: MilitaryBranchAffiliation) {
  return MilitaryBranchAffiliationLabel[militaryBranchAffiliation] ?? '';
}
