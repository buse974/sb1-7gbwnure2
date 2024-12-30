import { Task, User } from '../types';
import { differenceInMinutes, parseISO } from 'date-fns';

export interface TimeStats {
  averageMinutes: number;
  fastestMinutes: number;
  slowestMinutes: number;
  totalTasks: number;
}

export interface CollaboratorTimeStats extends TimeStats {
  totalTimeSpent: number;
  contributionPercentage: number;
  expectedMinutes: number;
}

export const calculateCompletionTime = (task: Task): number | null => {
  if (!task?.statusHistory || task.status !== 'completed') {
    return null;
  }

  const startEvent = task.statusHistory.find(event => event.status === 'in-progress');
  const completeEvent = task.statusHistory.find(event => event.status === 'completed');

  if (!startEvent?.timestamp || !completeEvent?.timestamp) {
    return null;
  }

  return differenceInMinutes(
    parseISO(completeEvent.timestamp),
    parseISO(startEvent.timestamp)
  );
};

export const calculateExpectedTime = (tasks: Task[], taskTitle: string): number => {
  if (!tasks?.length) return 0;

  const similarTasks = tasks.filter(t => 
    t?.status === 'completed' && 
    t?.title === taskTitle
  );

  if (similarTasks.length === 0) {
    return 0;
  }

  const completionTimes = similarTasks.map(task => {
    const totalTime = task.collaborators?.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0) || 0;
    return totalTime;
  });

  return Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length);
};

export const calculateCollaboratorStats = (
  tasks: Task[],
  userId: string
): CollaboratorTimeStats | null => {
  if (!tasks?.length || !userId) return null;

  const userCompletedTasks = tasks.filter(task => 
    task?.status === 'completed' && 
    task?.collaborators?.some(collab => collab.userId === userId)
  );

  if (!userCompletedTasks.length) {
    return null;
  }

  const collaboratorStats = userCompletedTasks.map(task => {
    const collaborator = task.collaborators?.find(c => c.userId === userId);
    if (!collaborator) return null;

    const totalTaskTime = task.collaborators?.reduce(
      (sum, c) => sum + (c.timeSpent || 0),
      0
    ) || 0;

    const expectedTime = calculateExpectedTime(tasks, task.title);

    return {
      timeSpent: collaborator.timeSpent || 0,
      totalTaskTime,
      contributionPercentage: totalTaskTime > 0 ? ((collaborator.timeSpent || 0) / totalTaskTime) * 100 : 0,
      expectedTime
    };
  }).filter((stat): stat is NonNullable<typeof stat> => stat !== null);

  if (!collaboratorStats.length) return null;

  const timeSpentValues = collaboratorStats.map(stat => stat.timeSpent);

  return {
    averageMinutes: Math.round(
      timeSpentValues.reduce((a, b) => a + b, 0) / timeSpentValues.length
    ),
    fastestMinutes: Math.min(...timeSpentValues),
    slowestMinutes: Math.max(...timeSpentValues),
    totalTasks: userCompletedTasks.length,
    totalTimeSpent: timeSpentValues.reduce((a, b) => a + b, 0),
    contributionPercentage: collaboratorStats.reduce(
      (sum, stat) => sum + stat.contributionPercentage,
      0
    ) / collaboratorStats.length,
    expectedMinutes: Math.round(
      collaboratorStats.reduce((sum, stat) => sum + stat.expectedTime, 0) / collaboratorStats.length
    )
  };
};

export const calculateGlobalTimeStats = (tasks: Task[]): TimeStats | null => {
  if (!tasks?.length) return null;
  
  const completedTasks = tasks.filter(task => task?.status === 'completed');
  
  if (!completedTasks.length) {
    return null;
  }

  const taskTimes = completedTasks.map(task =>
    task.collaborators?.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0) || 0
  );

  return {
    averageMinutes: Math.round(
      taskTimes.reduce((a, b) => a + b, 0) / taskTimes.length
    ),
    fastestMinutes: Math.min(...taskTimes),
    slowestMinutes: Math.max(...taskTimes),
    totalTasks: completedTasks.length
  };
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};