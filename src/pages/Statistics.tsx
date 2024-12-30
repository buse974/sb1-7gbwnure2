import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useZoneStore } from '../store/zoneStore';
import { useUserStore } from '../store/userStore';
import GlobalTaskOverview from '../components/statistics/GlobalTaskOverview';
import TaskDistribution from '../components/statistics/TaskDistribution';
import EmployeePerformance from '../components/statistics/sections/EmployeePerformance';
import TaskTimeAnalysis from '../components/statistics/sections/TaskTimeAnalysis';
import TrendsAndHistory from '../components/statistics/sections/TrendsAndHistory';
import AbnormalTasksSection from '../components/statistics/sections/AbnormalTasksSection';
import StatisticsFilters from '../components/statistics/StatisticsFilters';

const Statistics = () => {
  const user = useAuthStore(state => state.user);
  const users = useUserStore(state => state.users);
  const tasks = useTaskStore(state => state.tasks);
  const zones = useZoneStore(state => state.zones);

  const [filters, setFilters] = useState({
    timeRange: 'month' as const,
    zoneId: undefined as string | undefined,
    subZoneId: undefined as string | undefined,
    userId: undefined as string | undefined
  });

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    // Apply zone filter
    if (filters.zoneId && task.zoneId !== filters.zoneId) {
      return false;
    }

    // Apply sub-zone filter
    if (filters.subZoneId && task.subZoneId !== filters.subZoneId) {
      return false;
    }

    // Apply user filter
    if (filters.userId && !task.collaborators?.some(c => c.userId === filters.userId)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyse détaillée des performances et de l'activité
        </p>
      </div>

      <StatisticsFilters
        filters={filters}
        onFilterChange={setFilters}
        zones={zones}
        users={users}
      />

      <GlobalTaskOverview tasks={filteredTasks} />
      <TaskDistribution tasks={filteredTasks} />
      <EmployeePerformance tasks={filteredTasks} users={users} zones={zones} />
      <TaskTimeAnalysis tasks={filteredTasks} users={users} zones={zones} />
      <AbnormalTasksSection tasks={filteredTasks} users={users} zones={zones} />
      <TrendsAndHistory tasks={filteredTasks} timeRange={filters.timeRange} />
    </div>
  );
};

export default Statistics;