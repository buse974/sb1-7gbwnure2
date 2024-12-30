import React from 'react';
import { Task, User } from '../../types';
import { calculateUserPerformance } from '../../utils/statistics';
import { formatDuration } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CollaboratorPerformanceProps {
  tasks: Task[];
  users: User[];
}

const CollaboratorPerformance: React.FC<CollaboratorPerformanceProps> = ({ tasks, users }) => {
  const performanceData = users
    .filter(user => user.role !== 'admin')
    .map(user => ({
      user,
      ...calculateUserPerformance(tasks, user.id)
    }))
    .sort((a, b) => b.completedTasks - a.completedTasks);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Performance des Collaborateurs</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collaborateur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tâches Terminées
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temps Moyen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map(({ user, completedTasks, averageTime, performance }) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {completedTasks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDuration(averageTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {Math.abs(performance) < 5 ? (
                      <Minus className="h-4 w-4 text-gray-400" />
                    ) : performance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`ml-2 text-sm font-medium ${
                      Math.abs(performance) < 5
                        ? 'text-gray-500'
                        : performance > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {Math.abs(performance) < 5
                        ? 'Dans la moyenne'
                        : `${Math.abs(performance).toFixed(1)}% ${
                            performance > 0 ? 'plus rapide' : 'plus lent'
                          }`}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollaboratorPerformance;