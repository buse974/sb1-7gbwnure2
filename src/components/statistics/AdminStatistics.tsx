import React from 'react';
import { Task, User, Zone } from '../../types';
import CollaboratorPerformance from './CollaboratorPerformance';
import TaskTimeAnalysis from './sections/TaskTimeAnalysis';
import AbnormalTasksSection from './sections/AbnormalTasksSection';
import TrendsAndHistory from './sections/TrendsAndHistory';

interface AdminStatisticsProps {
  tasks: Task[];
  users: User[];
  zones: Zone[];
}

const AdminStatistics: React.FC<AdminStatisticsProps> = ({ tasks, users, zones }) => {
  return (
    <div className="space-y-8">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Section Administrateur - Statistiques détaillées
            </p>
          </div>
        </div>
      </div>

      <CollaboratorPerformance tasks={tasks} users={users} />
      <TaskTimeAnalysis tasks={tasks} users={users} zones={zones} />
      <AbnormalTasksSection tasks={tasks} users={users} zones={zones} />
      <TrendsAndHistory tasks={tasks} />
    </div>
  );
};

export default AdminStatistics;