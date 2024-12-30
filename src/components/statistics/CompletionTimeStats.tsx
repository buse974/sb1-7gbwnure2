import React from 'react';
import { Task } from '../../types';
import { Clock, CheckSquare } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface CompletionTimeStatsProps {
  tasks: Task[];
}

const CompletionTimeStats: React.FC<CompletionTimeStatsProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  const averageTime = completedTasks.length > 0
    ? completedTasks.reduce((acc, task) => {
        const totalTime = task.collaborators?.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0) || 0;
        return acc + totalTime;
      }, 0) / completedTasks.length
    : 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Temps de Réalisation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps Moyen de Réalisation</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatDuration(averageTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tâches Complétées</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {completedTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionTimeStats;