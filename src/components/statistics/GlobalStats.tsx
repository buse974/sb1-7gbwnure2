import React from 'react';
import { Task } from '../../types';
import { CheckSquare, Clock, AlertTriangle, ListChecks } from 'lucide-react';
import { calculateAverageCompletionTime } from '../../utils/statistics';
import { formatDuration } from '../../utils/formatters';

interface GlobalStatsProps {
  tasks: Task[];
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const averageCompletionTime = calculateAverageCompletionTime(tasks);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 bg-opacity-75">
            <ListChecks className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">{totalTasks}</h2>
            <p className="text-gray-500">Tâches Totales</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 bg-opacity-75">
            <CheckSquare className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">{completedTasks}</h2>
            <p className="text-gray-500">Terminées</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 bg-opacity-75">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">{inProgressTasks}</h2>
            <p className="text-gray-500">En Cours</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 bg-opacity-75">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">{overdueTasks}</h2>
            <p className="text-gray-500">En Retard</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 bg-opacity-75">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDuration(averageCompletionTime)}
            </h2>
            <p className="text-gray-500">Temps Moyen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;