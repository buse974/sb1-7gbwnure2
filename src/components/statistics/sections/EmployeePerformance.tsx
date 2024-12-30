import React from 'react';
import { Task, User, Zone } from '../../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateCollaboratorStats, formatDuration } from '../../../utils/timeStatistics';

interface EmployeePerformanceProps {
  tasks: Task[];
  users: User[];
  zones: Zone[];
}

const COLORS = {
  above: '#22C55E',
  below: '#EF4444',
  average: '#6B7280'
};

const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({ tasks, users, zones }) => {
  // Calculate global average completion time
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const globalAverageTime = completedTasks.length > 0
    ? completedTasks.reduce((acc, task) => {
        const totalTime = task.collaborators.reduce((sum, collab) => sum + collab.timeSpent, 0);
        return acc + totalTime;
      }, 0) / completedTasks.length
    : 0;

  // Calculate performance metrics for each user
  const userPerformance = users
    .filter(user => user.role !== 'admin')
    .map(user => {
      const userStats = calculateCollaboratorStats(tasks, user.id);
      
      if (!userStats) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tasksCompleted: 0,
          averageTime: 0,
          performance: 0,
          performanceLabel: 'N/A'
        };
      }

      const performance = globalAverageTime > 0
        ? ((globalAverageTime - userStats.averageMinutes) / globalAverageTime) * 100
        : 0;

      let performanceLabel;
      if (Math.abs(performance) < 5) {
        performanceLabel = 'Dans la moyenne';
      } else if (performance > 0) {
        performanceLabel = `${performance.toFixed(1)}% plus rapide`;
      } else {
        performanceLabel = `${Math.abs(performance).toFixed(1)}% plus lent`;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        tasksCompleted: userStats.totalTasks,
        averageTime: userStats.averageMinutes,
        performance,
        performanceLabel
      };
    })
    .sort((a, b) => b.performance - a.performance);

  const chartData = userPerformance.map(data => ({
    id: data.id,
    name: data.name,
    value: data.performance,
    color: Math.abs(data.performance) < 5 ? COLORS.average : data.performance > 0 ? COLORS.above : COLORS.below
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const userData = userPerformance.find(u => u.name === label);
      if (!userData) return null;

      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{label}</p>
          <div className="mt-1 space-y-1">
            <p className="text-sm text-gray-600">
              Tâches complétées: {userData.tasksCompleted}
            </p>
            <p className="text-sm text-gray-600">
              Temps moyen: {formatDuration(userData.averageTime)}
            </p>
            <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
              {userData.performanceLabel}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Performance des Employés</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps Moyen Global</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatDuration(globalAverageTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Plus Performant</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {userPerformance.length > 0 && userPerformance[0].performance > 0
                  ? userPerformance[0].name
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Moins Performant</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {userPerformance.length > 0 && userPerformance[userPerformance.length - 1].performance < 0
                  ? userPerformance[userPerformance.length - 1].name
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              label={{ 
                value: 'Écart par rapport à la moyenne (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Employé
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tâches Complétées
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Temps Moyen
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {userPerformance.map((data) => (
                <tr key={data.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {data.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {data.tasksCompleted}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDuration(data.averageTime)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        Math.abs(data.performance) < 5
                          ? 'bg-gray-100 text-gray-800'
                          : data.performance > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {Math.abs(data.performance) < 5 ? (
                        <Minus className="h-4 w-4 mr-1" />
                      ) : data.performance > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {data.performanceLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformance;