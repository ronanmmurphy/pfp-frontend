import { StatusBadgeClass, StatusLabel } from '../consts/session.const';
import { EligibilityLabel, MilitaryBranchAffiliationLabel, UserRoleLabel } from '../consts/user.const';

export function getRoleText(r: number) {
  return UserRoleLabel[r] ?? 'Unknown';
}

export function getFullName(firstName: string, lastName?: string) {
  return firstName + ' ' + lastName;
}

export function getLocationText(streetAddress1: string, streetAddress2?: string, city?: string, state?: string) {
  const parts = [streetAddress1, streetAddress2, city, state].filter(Boolean);
  return parts.join(', ');
}

export function getSeekingEmploymentText(s: boolean | undefined | null) {
  if (s === true) {
    return 'Yes';
  } else if (s === false) {
    return 'No';
  }
  return '';
}

export function getEligibilityText(e: number) {
  return EligibilityLabel[e] ?? '';
}

export function getMilitaryBranchAffiliationText(m: number) {
  return MilitaryBranchAffiliationLabel[m] ?? '';
}

export function getBadgeClass(s: number) {
  return StatusBadgeClass[s] ?? 'bg-secondary';
}

export function getStatusText(s: number) {
  return StatusLabel[s] ?? 'Unknown';
}
