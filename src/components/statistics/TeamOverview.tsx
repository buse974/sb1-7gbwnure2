import React from 'react';
import { Task, Zone } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface TeamOverviewProps {
  tasks: Task[];
  zones: Zone[];
}

const COLORS = {
  completed: '#22C55E',
  inProgress: '#EAB308',
  pending: '#9CA3AF'
};

const TeamOverview: React.FC<TeamOverviewProps> = ({ tasks, zones }) => {
  const zoneData = zones.map(zone => {
    const zoneTasks = tasks.filter(task => task.zoneId === zone.id);
    const completed = zoneTasks.filter(t => t.status === 'completed').length;
    const inProgress = zoneTasks.filter(t => t.status === 'in-progress').length;
    const pending = zoneTasks.filter(t => t.status === 'available').length;

    return {
      id: zone.id,
      name: zone.name,
      completed,
      inProgress,
      pending,
      total: zoneTasks.length
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {`${payload[0].value} tâches`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Vue d'Ensemble par Zone</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={zoneData.map(d => ({ name: d.name, value: d.total }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {zoneData.map(zone => (
            <div key={`zone-stats-${zone.id}`} className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900">{zone.name}</h3>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Terminées</p>
                  <p className="text-sm font-medium text-green-600">{zone.completed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">En Cours</p>
                  <p className="text-sm font-medium text-yellow-600">{zone.inProgress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">En Attente</p>
                  <p className="text-sm font-medium text-gray-600">{zone.pending}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;