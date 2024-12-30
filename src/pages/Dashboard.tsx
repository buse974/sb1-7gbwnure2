import React, { useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, ListChecks } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import TaskCard from '../components/tasks/TaskCard';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on status and user assignment
  const assignedTasks = tasks.filter(task => 
    task.collaborators.some(c => c.userId === user?.id && c.status !== 'completed')
  );

  const availableTasks = tasks.filter(task => 
    task.status !== 'completed' && (
      task.collaborators.length === 0 || 
      !task.collaborators.some(c => c.userId === user?.id)
    )
  );

  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed' || !task.deadlineDate) return false;
    return isPast(parseISO(task.deadlineDate));
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueCount = overdueTasks.length;

  const stats = [
    {
      title: 'Tâches Totales',
      count: totalTasks,
      icon: ListChecks,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Terminées',
      count: completedTasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'En Cours',
      count: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'En Retard',
      count: overdueCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor} bg-opacity-75`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">{stat.count}</h2>
                <p className="text-gray-500">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
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