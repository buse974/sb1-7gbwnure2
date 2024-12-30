import React, { useMemo } from 'react';
import { Task, User, Zone } from '../../../types';
import { HorizontalBarChart } from '../ChartComponents';
import { calculateCollaboratorStats, formatDuration } from '../../../utils/timeStatistics';

interface TaskTimeAnalysisProps {
  tasks: Task[];
  users: User[];
  zones: Zone[];
}

const TaskTimeAnalysis: React.FC<TaskTimeAnalysisProps> = ({ tasks, users, zones }) => {
  const { subZoneAverages, userDeviations } = useMemo(() => {
    // Calculate global averages per sub-zone and task
    const subZoneAverages = zones.reduce((acc, zone) => {
      zone.subZones.forEach(subZone => {
        const subZoneTasks = tasks.filter(t => 
          t.status === 'completed' && 
          t.subZoneId === subZone.id
        );
        
        if (subZoneTasks.length > 0) {
          // Group tasks by title to get averages for specific tasks
          const taskGroups = subZoneTasks.reduce((groups, task) => {
            if (!groups[task.title]) {
              groups[task.title] = [];
            }
            groups[task.title].push(task);
            return groups;
          }, {} as Record<string, Task[]>);

          // Calculate averages for each task type
          Object.entries(taskGroups).forEach(([taskTitle, taskList]) => {
            const totalTime = taskList.reduce((sum, task) => {
              const stats = calculateCollaboratorStats([task], task.assignedTo || '');
              return sum + (stats?.averageMinutes || 0);
            }, 0);

            const key = `${subZone.id}-${taskTitle}`;
            acc[key] = {
              zoneName: zone.name,
              subZoneName: subZone.name,
              taskTitle,
              averageTime: totalTime / taskList.length,
              taskCount: taskList.length
            };
          });
        }
      });
      return acc;
    }, {} as Record<string, {
      zoneName: string;
      subZoneName: string;
      taskTitle: string;
      averageTime: number;
      taskCount: number;
    }>);

    // Calculate user performance deviations
    const userDeviations = users.map(user => {
      let totalDeviation = 0;
      let taskCount = 0;

      Object.entries(subZoneAverages).forEach(([key, stats]) => {
        const userTasks = tasks.filter(t => 
          t.status === 'completed' && 
          t.assignedTo === user.id &&
          t.title === stats.taskTitle
        );
        
        if (userTasks.length > 0) {
          const userTimeStats = calculateCollaboratorStats(userTasks, user.id);
          if (userTimeStats) {
            const deviation = ((stats.averageTime - userTimeStats.averageMinutes) / stats.averageTime) * 100;
            totalDeviation += deviation * userTasks.length; // Weight by number of tasks
            taskCount += userTasks.length;
          }
        }
      });

      const averageDeviation = taskCount > 0 ? totalDeviation / taskCount : 0;

      return {
        name: user.name,
        value: averageDeviation,
        color: averageDeviation > 0 ? '#22C55E' : '#EF4444'
      };
    }).sort((a, b) => b.value - a.value);

    return { subZoneAverages, userDeviations };
  }, [tasks, users, zones]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Analyse des Temps de Réalisation</h2>

      {/* Sub-zone Task Times Table */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Temps Moyens par Tâche et Sous-zone
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Zone / Sous-zone
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Tâche
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Temps Moyen
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Nombre d'Occurrences
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {Object.entries(subZoneAverages).map(([key, stats]) => (
                <tr key={key}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="font-medium text-gray-900">{stats.zoneName}</div>
                    <div className="text-gray-500">{stats.subZoneName}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {stats.taskTitle}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDuration(stats.averageTime)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stats.taskCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Deviations Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Écarts de Performance Individuels
        </h3>
        <HorizontalBarChart
          data={userDeviations}
          valueFormatter={(value) => `${value.toFixed(1)}% ${value > 0 ? 'plus rapide' : 'plus lent'}`}
          height={400}
          maxBarSize={40}
        />
      </div>
    </div>
  );
};

export default TaskTimeAnalysis;