import React from 'react';
import { Task } from '../../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TrendsAndHistoryProps {
  tasks: Task[];
  timeRange: 'week' | 'month' | 'year';
}

const TrendsAndHistory: React.FC<TrendsAndHistoryProps> = ({ tasks, timeRange }) => {
  const now = new Date();
  const getDateRange = () => {
    const end = now;
    const start = new Date(end);

    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7);
        return { start, end };
      case 'month':
        start.setMonth(end.getMonth() - 1);
        return { start, end };
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        return { start, end };
    }
  };

  const generateIntervals = () => {
    const { start, end } = getDateRange();
    const intervals: { start: Date; end: Date; label: string }[] = [];

    let current = new Date(start);
    while (current < end) {
      let intervalEnd: Date;
      let label: string;

      switch (timeRange) {
        case 'week':
          intervalEnd = new Date(current);
          intervalEnd.setDate(current.getDate() + 1);
          label = format(current, 'dd MMM', { locale: fr });
          break;
        case 'month':
          intervalEnd = new Date(current);
          intervalEnd.setDate(current.getDate() + 7);
          label = format(current, 'dd MMM', { locale: fr });
          break;
        case 'year':
          intervalEnd = new Date(current);
          intervalEnd.setMonth(current.getMonth() + 1);
          label = format(current, 'MMM yyyy', { locale: fr });
          break;
      }

      intervals.push({
        start: current,
        end: intervalEnd,
        label
      });

      current = new Date(intervalEnd);
    }

    return intervals;
  };

  const data = generateIntervals().map(interval => {
    const periodTasks = tasks.filter(task => {
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, {
        start: interval.start,
        end: interval.end
      });
    });

    const completed = periodTasks.filter(task => task.status === 'completed').length;
    const inProgress = periodTasks.filter(task => task.status === 'in-progress').length;
    const overdue = periodTasks.filter(task => {
      if (!task.deadlineDate || task.status === 'completed') return false;
      return parseISO(task.deadlineDate) < interval.end;
    }).length;

    return {
      date: interval.label,
      completed,
      inProgress,
      overdue
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">Période: {label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Terminées: {payload[0]?.value || 0}
            </p>
            <p className="text-sm text-yellow-600">
              En cours: {payload[1]?.value || 0}
            </p>
            <p className="text-sm text-red-600">
              En retard: {payload[2]?.value || 0}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Tendances et Historique</h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={timeRange === 'week' ? 0 : 'preserveStartEnd'}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => {
                switch (value) {
                  case 'completed':
                    return 'Terminées';
                  case 'inProgress':
                    return 'En cours';
                  case 'overdue':
                    return 'En retard';
                  default:
                    return value;
                }
              }}
            />
            <Line
              name="completed"
              type="monotone"
              dataKey="completed"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="inProgress"
              type="monotone"
              dataKey="inProgress"
              stroke="#EAB308"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="overdue"
              type="monotone"
              dataKey="overdue"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Évolution des tâches sur la période sélectionnée</p>
      </div>
    </div>
  );
};

export default TrendsAndHistory;