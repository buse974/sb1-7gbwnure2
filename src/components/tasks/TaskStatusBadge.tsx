import React from 'react';
import { Clock, CheckSquare, Pause, AlertTriangle, Users } from 'lucide-react';
import { Task, User } from '../../types';

interface TaskStatusBadgeProps {
  task: Task;
  users: User[];
  showDetails?: boolean;
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ task, users, showDetails = false }) => {
  const totalCollaborators = task.collaborators.length;
  const completedCollaborators = task.collaborators.filter(c => c.status === 'completed').length;
  const activeCollaborators = task.collaborators.filter(c => c.status === 'active').length;
  const pausedCollaborators = task.collaborators.filter(c => c.status === 'paused').length;

  const getStatusColor = () => {
    if (completedCollaborators === totalCollaborators) {
      return 'bg-green-100 text-green-800';
    }
    if (activeCollaborators > 0) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (pausedCollaborators > 0) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusIcon = () => {
    if (completedCollaborators === totalCollaborators) {
      return <CheckSquare className="h-4 w-4" />;
    }
    if (activeCollaborators > 0) {
      return <Clock className="h-4 w-4" />;
    }
    if (pausedCollaborators > 0) {
      return <Pause className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  const getStatusLabel = () => {
    if (completedCollaborators === totalCollaborators) {
      return 'Terminée';
    }
    if (activeCollaborators > 0) {
      return `${activeCollaborators} actif${activeCollaborators > 1 ? 's' : ''}`;
    }
    if (pausedCollaborators > 0) {
      return `${pausedCollaborators} en pause`;
    }
    return 'Assignée';
  };

  const getCollaboratorDetails = () => {
    return task.collaborators.map(collab => {
      const user = users.find(u => u.id === collab.userId);
      if (!user) return null;

      const getStatusStyle = (status: string) => {
        switch (status) {
          case 'completed':
            return 'text-green-600';
          case 'active':
            return 'text-yellow-600';
          case 'paused':
            return 'text-orange-600';
          default:
            return 'text-gray-600';
        }
      };

      const getStatusIcon = (status: string) => {
        switch (status) {
          case 'completed':
            return <CheckSquare className="h-3 w-3" />;
          case 'active':
            return <Clock className="h-3 w-3" />;
          case 'paused':
            return <Pause className="h-3 w-3" />;
          default:
            return <Users className="h-3 w-3" />;
        }
      };

      return (
        <div key={collab.userId} className="flex items-center space-x-2 text-xs">
          <span className={`inline-flex items-center ${getStatusStyle(collab.status)}`}>
            {getStatusIcon(collab.status)}
          </span>
          <span className="font-medium">{user.name}:</span>
          <span className={getStatusStyle(collab.status)}>
            {collab.status === 'completed' ? 'Terminé' :
             collab.status === 'active' ? 'En cours' :
             collab.status === 'paused' ? 'En pause' : 'Assigné'}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusLabel()}</span>
        <span className="ml-1.5 text-xs">
          ({completedCollaborators}/{totalCollaborators})
        </span>
      </div>
      {showDetails && (
        <div className="mt-2 space-y-1 bg-gray-50 rounded-md p-2">
          {getCollaboratorDetails()}
        </div>
      )}
    </div>
  );
};

export default TaskStatusBadge;