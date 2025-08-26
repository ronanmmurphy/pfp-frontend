import { SessionStatus } from '../enums/session.enum';

export const StatusBadgeClass: Record<number, string> = {
  [SessionStatus.REQUESTED]: 'bg-warning',
  [SessionStatus.RESCHEDULE_REQUESTED]: 'bg-warning',
  [SessionStatus.SCHEDULED]: 'bg-success',
  [SessionStatus.COMPLETED]: 'bg-info',
  [SessionStatus.CANCELED]: 'bg-danger'
};

export const StatusLabel: Record<number, string> = {
  [SessionStatus.REQUESTED]: 'Requested',
  [SessionStatus.SCHEDULED]: 'Scheduled',
  [SessionStatus.RESCHEDULE_REQUESTED]: 'Reschedule Requested',
  [SessionStatus.COMPLETED]: 'Completed',
  [SessionStatus.CANCELED]: 'Canceled'
};
