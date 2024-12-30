import React from 'react';
import { Task } from '../../types';
import { CheckSquare, Clock, AlertTriangle, Users } from 'lucide-react';

interface TaskProgressSummaryProps {
  tasks: Task[];
}

const TaskProgressSummary: React.FC<TaskProgressSummaryProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const availableTasks = tasks.filter(t => t.status === 'available').length;

  const stats = [
    {
      label: 'Tâches Totales',
      value: totalTasks,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Terminées',
      value: completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'En Cours',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Disponibles',
      value: availableTasks,
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Progression des Tâches</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskProgressSummary;