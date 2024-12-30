import React from 'react';
import { Task } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface TaskDistributionProps {
  tasks: Task[];
}

const COLORS = {
  completed: '#22C55E',
  inProgress: '#EAB308',
  available: '#3B82F6',
  overdue: '#EF4444'
};

const TaskDistribution: React.FC<TaskDistributionProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const availableTasks = tasks.filter(t => t.status === 'available').length;
  const overdueTasks = tasks.filter(t => 
    t.status !== 'completed' && 
    t.hasDeadline && 
    t.deadlineDate && 
    new Date(t.deadlineDate) < new Date()
  ).length;

  const data = [
    { name: 'Terminées', value: completedTasks, color: COLORS.completed },
    { name: 'En Cours', value: inProgressTasks, color: COLORS.inProgress },
    { name: 'Disponibles', value: availableTasks, color: COLORS.available },
    { name: 'En Retard', value: overdueTasks, color: COLORS.overdue }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalTasks) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {`${payload[0].value} tâches (${percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Distribution des Tâches</h2>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={150}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {data.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskDistribution;