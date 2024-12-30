import { Task, DelayStatus } from '../types';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

const PRIORITY_TOLERANCES = {
  1: 1,  // High priority: 1 day tolerance
  2: 3,  // Medium priority: 3 days tolerance
  3: 5   // Low priority: 5 days tolerance
};

export const calculateDelayStatus = (
  task: Task,
  subZonePriority?: 1 | 2 | 3
): DelayStatus => {
  if (task.status === 'completed') return null;

  const today = startOfDay(new Date());
  const actionDate = startOfDay(parseISO(task.actionDate));
  const daysElapsed = differenceInDays(today, actionDate);

  if (!subZonePriority) return null;

  const tolerance = PRIORITY_TOLERANCES[subZonePriority];

  if (daysElapsed > tolerance) {
    return 'overdue';
  } else if (daysElapsed === tolerance) {
    return 'near-delay';
  }

  return 'on-track';
};

export const getDelayStatusStyles = (delayStatus: DelayStatus) => {
  switch (delayStatus) {
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'near-delay':
      return 'bg-yellow-100 text-yellow-800';
    case 'on-track':
      return 'bg-green-100 text-green-800';
    default:
      return '';
  }
};

export const getDelayStatusLabel = (delayStatus: DelayStatus) => {
  switch (delayStatus) {
    case 'overdue':
      return 'En retard';
    case 'near-delay':
      return 'Proche du retard';
    case 'on-track':
      return 'Dans les temps';
    default:
      return '';
  }
};