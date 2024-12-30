import React from 'react';
import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { Task, User } from '../../types';
import {
  calculateCollaboratorStats,
  calculateGlobalTimeStats,
  formatDuration,
  type TimeStats
} from '../../utils/timeStatistics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeStatsSectionProps {
  tasks: Task[];
  users: User[];
}

const TimeStatsSection: React.FC<TimeStatsSectionProps> = ({ tasks, users }) => {
  const globalStats = calculateGlobalTimeStats(tasks);

  // Prepare data for the completion time chart
  const completionTimeData = users.map(user => {
    const stats = calculateCollaboratorStats(tasks, user.id);
    return {
      name: user.name,
      average: stats ? stats.averageMinutes : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            {`Temps Moyen: ${formatDuration(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Statistiques des Temps de Complétion</h2>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps Moyen Global</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {globalStats ? formatDuration(globalStats.averageMinutes) : 'N/A'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {globalStats?.totalTasks || 0} tâches complétées
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Complétion la Plus Rapide</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {globalStats ? formatDuration(globalStats.fastestMinutes) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Complétion la Plus Longue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {globalStats ? formatDuration(globalStats.slowestMinutes) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Time Chart */}
      <div className="mb-8">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={completionTimeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                name="Temps Moyen (minutes)"
                dataKey="average"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Utilisateur
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Temps Moyen
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Plus Rapide
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Plus Long
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tâches Complétées
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map(user => {
              const stats = calculateCollaboratorStats(tasks, user.id);
              const roleLabel = user.role === 'admin' ? ' (Admin)' : '';
              
              return (
                <tr key={user.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="font-medium text-gray-900">{user.name}{roleLabel}</div>
                    <div className="text-gray-500">{user.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stats ? formatDuration(stats.averageMinutes) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stats ? formatDuration(stats.fastestMinutes) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stats ? formatDuration(stats.slowestMinutes) : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stats?.totalTasks || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeStatsSection;