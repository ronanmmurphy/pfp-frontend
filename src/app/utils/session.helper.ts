import { SessionOutcome, SessionStatus } from '../enums/session.enum';

export const SessionStatusBadgeClass: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'bg-success',
  [SessionStatus.COMPLETED]: 'bg-warning',
  [SessionStatus.CANCELED]: 'bg-danger'
};

export const SessionStatusLabel: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'Scheduled',
  [SessionStatus.COMPLETED]: 'Completed',
  [SessionStatus.CANCELED]: 'Canceled'
};

export const SessionOutcomeLabel: Record<SessionOutcome, string> = {
  [SessionOutcome.PHOTOS_HAVE_BEEN_PROVIDED_TO_THE_PATRIOT]: 'Photos have been provided to the Patriot',
  [SessionOutcome.PHOTOGRAPHER_HAS_NOT_PROVIDED_PHOTOS_YET]: 'Photographer has not provided photos yet',
  [SessionOutcome.PATRIOT_DID_NOT_SHOW_UP_FOR_APPOINTMENT]: 'Patriot did not show up for appointment',
  [SessionOutcome.NO_COMMUNICATION_UNABLE_TO_SCHEDULE]: 'No communication, unable to schedule',
  [SessionOutcome.OTHER]: 'Other'
};

export function getSessionBadgeClass(status: SessionStatus) {
  return SessionStatusBadgeClass[status] ?? 'bg-secondary';
}

export function getSessionStatusText(status: SessionStatus) {
  return SessionStatusLabel[status] ?? 'Unknown';
}
