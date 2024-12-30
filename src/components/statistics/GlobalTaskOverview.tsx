import React from 'react';
import { Task } from '../../types';
import { CheckSquare, Clock, AlertTriangle, ListChecks } from 'lucide-react';

interface GlobalTaskOverviewProps {
  tasks: Task[];
}

const GlobalTaskOverview: React.FC<GlobalTaskOverviewProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.hasDeadline && 
    t.deadlineDate && 
    new Date(t.deadlineDate) < new Date()
  ).length;

  const stats = [
    {
      title: 'Tâches Totales',
      count: totalTasks,
      icon: ListChecks,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Terminées',
      count: completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'En Cours',
      count: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'En Retard',
      count: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Vue d'ensemble des Tâches</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalTaskOverview;