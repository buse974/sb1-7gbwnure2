import { Task } from '../types';

export const calculateAverageCompletionTime = (tasks: Task[]): number => {
  const completedTasks = tasks.filter(task => 
    task.status === 'completed' && task.completedAt
  );

  if (completedTasks.length === 0) return 0;

  const totalTime = completedTasks.reduce((sum, task) => {
    const startDate = new Date(task.createdAt);
    const endDate = new Date(task.completedAt!);
    return sum + (endDate.getTime() - startDate.getTime());
  }, 0);

  return Math.round(totalTime / completedTasks.length / (1000 * 60)); // Convert to minutes
};

export const calculateUserPerformance = (tasks: Task[], userId: string) => {
  const userTasks = tasks.filter(task => task.assignedTo === userId);
  const completedTasks = userTasks.filter(task => task.status === 'completed');

  if (completedTasks.length === 0) {
    return {
      completedTasks: 0,
      averageTime: 0,
      performance: 0
    };
  }

  // Calculate average completion time for this user
  const userAverageTime = calculateAverageCompletionTime(completedTasks);

  // Calculate global average (excluding this user's tasks)
  const otherTasks = tasks.filter(task => 
    task.status === 'completed' && task.assignedTo !== userId
  );
  const globalAverageTime = calculateAverageCompletionTime(otherTasks);

  // Calculate performance difference (negative means slower, positive means faster)
  const performance = globalAverageTime === 0 ? 0 :
    ((globalAverageTime - userAverageTime) / globalAverageTime) * 100;

  return {
    completedTasks: completedTasks.length,
    averageTime: userAverageTime,
    performance
  };
};