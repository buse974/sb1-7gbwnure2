import React from 'react';
import { Task, Zone } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ZoneTaskDistributionProps {
  tasks: Task[];
  zones: Zone[];
}

const COLORS = {
  total: '#3B82F6',
  completed: '#22C55E',
  inProgress: '#EAB308',
  overdue: '#EF4444'
};

const ZoneTaskDistribution: React.FC<ZoneTaskDistributionProps> = ({ tasks, zones }) => {
  const data = zones.map(zone => {
    const zoneTasks = tasks.filter(task => task.zoneId === zone.id);
    const completed = zoneTasks.filter(t => t.status === 'completed').length;
    const inProgress = zoneTasks.filter(t => t.status === 'in-progress').length;
    const overdue = zoneTasks.filter(t => 
      t.status !== 'completed' && 
      t.hasDeadline && 
      t.deadlineDate && 
      new Date(t.deadlineDate) < new Date()
    ).length;

    return {
      name: zone.name,
      total: zoneTasks.length,
      completed,
      inProgress,
      overdue
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'total' ? 'Total' :
               entry.name === 'completed' ? 'Terminées' :
               entry.name === 'inProgress' ? 'En Cours' : 'En Retard'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Vue d'ensemble par Zone</h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="total" name="Total" fill={COLORS.total} radius={[0, 4, 4, 0]} />
            <Bar dataKey="completed" name="Terminées" fill={COLORS.completed} radius={[0, 4, 4, 0]} />
            <Bar dataKey="inProgress" name="En Cours" fill={COLORS.inProgress} radius={[0, 4, 4, 0]} />
            <Bar dataKey="overdue" name="En Retard" fill={COLORS.overdue} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ZoneTaskDistribution;