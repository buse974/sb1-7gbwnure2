import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useTaskStore } from '../../store/taskStore';
import { useZoneStore } from '../../store/zoneStore';
import GlobalTaskOverview from './sections/GlobalTaskOverview';
import EmployeePerformance from './sections/EmployeePerformance';
import TaskTimeAnalysis from './sections/TaskTimeAnalysis';
import TrendsAndHistory from './sections/TrendsAndHistory';
import AbnormalTasksSection from './sections/AbnormalTasksSection';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const StatisticsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const users = useUserStore(state => state.users);
  const tasks = useTaskStore(state => state.tasks);
  const zones = useZoneStore(state => state.zones);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">
          Analyse détaillée des performances et de l'activité
        </p>
      </div>

      <GlobalTaskOverview tasks={tasks} />
      <EmployeePerformance tasks={tasks} users={users} zones={zones} />
      <TaskTimeAnalysis tasks={tasks} users={users} zones={zones} />
      <AbnormalTasksSection tasks={tasks} users={users} zones={zones} />
      <TrendsAndHistory tasks={tasks} />
    </div>
  );
};

export default StatisticsPage;