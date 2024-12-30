import React from 'react';
import { Task } from '../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trash2, Loader, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, isLoading }) => {
  const users = useUserStore(state => state.users);

  const getStatusBadge = (task: Task) => {
    const collaborators = task.collaborators || [];
    const completedCount = collaborators.filter(c => c.status === 'completed').length;
    const totalCount = collaborators.length;
    const activeCount = collaborators.filter(c => c.status === 'active').length;
    const pausedCount = collaborators.filter(c => c.status === 'paused').length;

    let style = '';
    let label = '';

    if (totalCount === 0) {
      style = 'bg-blue-100 text-blue-800';
      label = 'Disponible';
    } else if (completedCount === totalCount) {
      style = 'bg-green-100 text-green-800';
      label = 'Terminée';
    } else if (activeCount > 0) {
      style = 'bg-yellow-100 text-yellow-800';
      label = `En cours (${activeCount}/${totalCount})`;
    } else if (pausedCount > 0) {
      style = 'bg-orange-100 text-orange-800';
      label = `En pause (${pausedCount}/${totalCount})`;
    } else {
      style = 'bg-gray-100 text-gray-800';
      label = 'Assignée';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const getCollaboratorsList = (task: Task) => {
    const collaborators = task.collaborators || [];
    
    if (collaborators.length === 0) {
      return (
        <div className="flex items-center text-gray-400 text-sm">
          <Users className="h-4 w-4 mr-1.5" />
          Disponible pour tous
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {collaborators.map(collab => {
          const user = users.find(u => u.id === collab.userId);
          if (!user) return null;

          return (
            <div key={collab.userId} className="flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                collab.status === 'completed' ? 'bg-green-100 text-green-800' :
                collab.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                collab.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.name}
                <span className="ml-1 text-xs opacity-75">
                  {collab.status === 'completed' ? '✓' :
                   collab.status === 'active' ? '►' :
                   collab.status === 'paused' ? '❚❚' : ''}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), 'Pp', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune tâche disponible</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Titre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Collaborateurs
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'action
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                {task.description && (
                  <div className="text-sm text-gray-500">{task.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(task)}
              </td>
              <td className="px-6 py-4">
                {getCollaboratorsList(task)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {formatDate(task.actionDate) || 'Non définie'}
                  </span>
                </div>
                {task.hasDeadline && task.deadlineDate && (
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-sm text-red-600">
                      {formatDate(task.deadlineDate) || 'Non définie'}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(task)}
                  className="text-green-600 hover:text-green-900 mr-4"
                  title="Modifier"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;