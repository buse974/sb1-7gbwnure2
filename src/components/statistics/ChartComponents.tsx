import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CheckSquare, Clock, AlertTriangle, Users } from 'lucide-react';

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    type?: string;
  }>;
}

export const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  if (!payload) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckSquare className="h-4 w-4" />;
      case 'inProgress':
        return <Clock className="h-4 w-4" />;
      case 'unassigned':
        return <Users className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={index} className="flex items-center">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${entry.color}15`,
              color: entry.color
            }}
          >
            {entry.type && getIcon(entry.type)}
            <span className="ml-1">{entry.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any) => string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label,
  formatter 
}) => {
  if (active && payload && payload.length) {
    const value = formatter ? formatter(payload[0].value) : payload[0].value;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium">{label || payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {`${payload[0].name}: ${value}`}
        </p>
      </div>
    );
  }
  return null;
};

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  valueFormatter?: (value: number) => string;
  height?: number;
  maxBarSize?: number;
  baseColor?: string;
  positiveColor?: string;
  negativeColor?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  valueFormatter = (value) => `${value}`,
  height = 400,
  maxBarSize = 40,
  baseColor = '#6B7280',
  positiveColor = '#22C55E',
  negativeColor = '#EF4444'
}) => {
  // Ensure minimum bar visibility
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
  
  // Add padding to domain for better visibility
  const domainPadding = absMax * 0.1;
  const domain = [-absMax - domainPadding, absMax + domainPadding];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={domain}
          tickFormatter={(value) => `${Math.abs(value).toFixed(1)}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value;
              return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                  <p className="font-medium">{payload[0].payload.name}</p>
                  <p className="text-sm text-gray-600">
                    {valueFormatter(value)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {value > 0 ? 'Plus rapide' : 'Plus lent'} que la moyenne
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="value"
          maxBarSize={maxBarSize}
          animationDuration={1000}
          animationBegin={200}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value === 0 ? baseColor : entry.value > 0 ? positiveColor : negativeColor}
              fillOpacity={Math.max(0.3, Math.min(1, Math.abs(entry.value) / absMax))}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};