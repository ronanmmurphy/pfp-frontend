import { ReferralStatus } from '../enums/referral.enum';

export const ReferralStatusBadgeClass: Record<ReferralStatus, string> = {
  [ReferralStatus.MATCHED]: 'bg-success',
  [ReferralStatus.CANCELED]: 'bg-danger'
};

export const ReferralStatusLabel: Record<ReferralStatus, string> = {
  [ReferralStatus.MATCHED]: 'Matched',
  [ReferralStatus.CANCELED]: 'Canceled'
};

export function getReferralBadgeClass(status: ReferralStatus) {
  return ReferralStatusBadgeClass[status] ?? 'bg-secondary';
}

export function getReferralStatusText(status: ReferralStatus) {
  return ReferralStatusLabel[status] ?? 'Unknown';
}
