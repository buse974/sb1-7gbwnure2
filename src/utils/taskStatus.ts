import { Task } from '../types';

export const getTaskStatusInfo = (task: Task) => {
  const collaborators = task.collaborators || [];
  const completedCount = collaborators.filter(c => c.status === 'completed').length;
  const totalCount = collaborators.length;
  const activeCount = collaborators.filter(c => c.status === 'active').length;
  const pausedCount = collaborators.filter(c => c.status === 'paused').length;

  let style = '';
  let label = '';
  let status: Task['status'] = 'available';

  if (totalCount === 0) {
    style = 'bg-blue-100 text-blue-800';
    label = 'Disponible';
    status = 'available';
  } else if (completedCount === totalCount) {
    style = 'bg-green-100 text-green-800';
    label = 'Terminée';
    status = 'completed';
  } else if (activeCount > 0) {
    style = 'bg-yellow-100 text-yellow-800';
    label = `En cours (${activeCount}/${totalCount})`;
    status = 'in-progress';
  } else if (pausedCount > 0) {
    style = 'bg-orange-100 text-orange-800';
    label = `En pause (${pausedCount}/${totalCount})`;
    status = 'pending';
  } else {
    style = 'bg-gray-100 text-gray-800';
    label = 'Assignée';
    status = 'available';
  }

  return { style, label, status };
};

export const isTaskCompletedForUser = (task: Task, userId: string): boolean => {
  const collaborator = task.collaborators.find(c => c.userId === userId);
  return collaborator?.status === 'completed';
};

export const isTaskAssignedToUser = (task: Task, userId: string): boolean => {
  return task.collaborators.some(c => c.userId === userId);
};

export const getTaskProgress = (task: Task): number => {
  const collaborators = task.collaborators || [];
  if (collaborators.length === 0) return 0;
  
  const completedCount = collaborators.filter(c => c.status === 'completed').length;
  return (completedCount / collaborators.length) * 100;
};