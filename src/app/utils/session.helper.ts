import { SessionStatus } from '../enums/session.enum';

export const SessionStatusBadgeClass: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'bg-warning',
  [SessionStatus.RESCHEDULED]: 'bg-warning',
  [SessionStatus.COMPLETED]: 'bg-success',
  [SessionStatus.CANCELED]: 'bg-danger'
};

export const SessionStatusLabel: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'Scheduled',
  [SessionStatus.RESCHEDULED]: 'Rescheduled',
  [SessionStatus.COMPLETED]: 'Completed',
  [SessionStatus.CANCELED]: 'Canceled'
};

export function getSessionBadgeClass(status: SessionStatus) {
  return SessionStatusBadgeClass[status] ?? 'bg-secondary';
}

export function getSessionStatusText(status: SessionStatus) {
  return SessionStatusLabel[status] ?? 'Unknown';
}
