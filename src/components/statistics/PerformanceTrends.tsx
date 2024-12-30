import React from 'react';
import { Task, User } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, startOfMonth, startOfYear, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PerformanceTrendsProps {
  tasks: Task[];
  users: User[];
  timeRange: 'week' | 'month' | 'year';
}

const PerformanceTrends: React.FC<PerformanceTrendsProps> = ({ tasks, users, timeRange }) => {
  const getTimeIntervals = () => {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        return eachWeekOfInterval({ start, end }, { locale: fr });
      case 'month':
        start.setMonth(end.getMonth() - 1);
        return eachMonthOfInterval({ start, end });
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        return eachYearOfInterval({ start, end });
    }
  };

  const formatDate = (date: Date) => {
    switch (timeRange) {
      case 'week':
        return format(date, 'dd MMM', { locale: fr });
      case 'month':
        return format(date, 'MMM yyyy', { locale: fr });
      case 'year':
        return format(date, 'yyyy');
    }
  };

  const intervals = getTimeIntervals();
  const data = intervals.map(interval => {
    const nextInterval = new Date(interval);
    switch (timeRange) {
      case 'week':
        nextInterval.setDate(interval.getDate() + 7);
        break;
      case 'month':
        nextInterval.setMonth(interval.getMonth() + 1);
        break;
      case 'year':
        nextInterval.setFullYear(interval.getFullYear() + 1);
        break;
    }

    const periodTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= interval && taskDate < nextInterval;
    });

    return {
      date: formatDate(interval),
      completed: periodTasks.filter(t => t.status === 'completed').length,
      inProgress: periodTasks.filter(t => t.status === 'in-progress').length,
      overdue: periodTasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        return new Date(t.dueDate) < new Date();
      }).length
    };
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Tendances de Performance</h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="completed"
              name="Terminées"
              stroke="#22C55E"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              name="En Cours"
              stroke="#EAB308"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="overdue"
              name="En Retard"
              stroke="#EF4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrends;