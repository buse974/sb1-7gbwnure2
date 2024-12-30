import React from 'react';
import { Task } from '../../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CheckSquare, AlertTriangle, Clock, Users } from 'lucide-react';
import { startOfToday, isAfter, parseISO } from 'date-fns';

interface GlobalTaskOverviewProps {
  tasks: Task[];
}

const COLORS = {
  completed: '#22C55E',
  inProgress: '#EAB308',
  unassigned: '#3B82F6',
  overdue: '#EF4444'
};

const GlobalTaskOverview: React.FC<GlobalTaskOverviewProps> = ({ tasks }) => {
  const today = startOfToday();
  
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    unassigned: tasks.filter(t => t.status === 'available').length,
    overdue: tasks.filter(t => 
      t.status !== 'completed' && 
      t.hasDeadline && 
      t.deadlineDate && 
      isAfter(today, parseISO(t.deadlineDate))
    ).length
  };

  const chartData = [
    { name: 'Terminées', value: taskStats.completed, color: COLORS.completed },
    { name: 'En Cours', value: taskStats.inProgress, color: COLORS.inProgress },
    { name: 'Non Assignées', value: taskStats.unassigned, color: COLORS.unassigned },
    { name: 'En Retard', value: taskStats.overdue, color: COLORS.overdue }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {`${payload[0].value} tâches (${((payload[0].value / taskStats.total) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Vue d'ensemble des Tâches</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tâches Terminées</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {taskStats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Cours</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {taskStats.inProgress}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Non Assignées</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {taskStats.unassigned}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Retard</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {taskStats.overdue}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              outerRadius={150}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlobalTaskOverview;