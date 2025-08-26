import { Eligibility, MilitaryBranchAffiliation, UserRole } from '../enums/user.enum';

export const UserRoleLabel: Record<number, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.PHOTOGRAPHER]: 'Photographer',
  [UserRole.VETERAN]: 'Veteran'
};

export const EligibilityLabel: Record<number, string> = {
  [Eligibility.TRANSITIONING_SERVICE_MEMBER]: 'Transitioning Service Member',
  [Eligibility.GOLD_STAR_FAMILY_MEMBER]: 'Gold Star Family Member',
  [Eligibility.MILITARY_SPOUSE]: 'Military Spouse'
};

export const MilitaryBranchAffiliationLabel: Record<number, string> = {
  [MilitaryBranchAffiliation.US_AIR_FORCE]: 'US Air Force',
  [MilitaryBranchAffiliation.US_ARMY]: 'US Army',
  [MilitaryBranchAffiliation.US_COST_GUARD]: 'US Cost Guard',
  [MilitaryBranchAffiliation.US_NAVY]: 'US Navy',
  [MilitaryBranchAffiliation.US_MARINE_CORPS]: 'US Marine Corps',
  [MilitaryBranchAffiliation.US_SPACE_FORCE]: 'US Space Force'
};
