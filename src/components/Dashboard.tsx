import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import TaskCard from './tasks/TaskCard';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckSquare, Clock, AlertTriangle, ListChecks } from 'lucide-react';

const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const tasks = useTaskStore(state => state.tasks);
  const getAssignedTasks = useTaskStore(state => state.getAssignedTasks);

  const assignedTasks = user ? getAssignedTasks(user.id) : [];
  const availableTasks = tasks.filter(task => task.collaborators.length === 0);
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed' || !task.deadlineDate) return false;
    return new Date(task.deadlineDate) < new Date();
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 bg-opacity-75">
              <ListChecks className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{tasks.length}</h2>
              <p className="text-gray-500">Tâches Totales</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 bg-opacity-75">
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </h2>
              <p className="text-gray-500">Terminées</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 bg-opacity-75">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'in-progress').length}
              </h2>
              <p className="text-gray-500">En Cours</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 bg-opacity-75">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{overdueTasks.length}</h2>
              <p className="text-gray-500">En Retard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Vos Tâches Assignées
            {assignedTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({assignedTasks.length})</span>
            )}
          </h2>
          <div className="space-y-4">
            {assignedTasks.length > 0 ? (
              assignedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune tâche assignée</p>
            )}
          </div>
        </div>

        {/* Available Tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tâches Disponibles
            {availableTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({availableTasks.length})</span>
            )}
          </h2>
          <div className="space-y-4">
            {availableTasks.length > 0 ? (
              availableTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune tâche disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Tâches en Retard
          {overdueTasks.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">({overdueTasks.length})</span>
          )}
        </h2>
        <div className="space-y-4">
          {overdueTasks.length > 0 ? (
            overdueTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune tâche en retard</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;