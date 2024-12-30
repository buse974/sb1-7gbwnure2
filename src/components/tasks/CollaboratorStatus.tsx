import React from 'react';
import { Task, User, CollaboratorStatus as Status } from '../../types';
import { CheckSquare, Clock, Pause, Users } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface CollaboratorStatusProps {
  task: Task;
  users: User[];
  currentUserId?: string;
  onStatusChange?: (userId: string, newStatus: Status) => void;
}

const CollaboratorStatus: React.FC<CollaboratorStatusProps> = ({
  task,
  users,
  currentUserId,
  onStatusChange
}) => {
  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'active':
        return 'En cours';
      case 'paused':
        return 'En pause';
      default:
        return 'Assigné';
    }
  };

  const getAvailableActions = (currentStatus: Status): Status[] => {
    switch (currentStatus) {
      case 'assigned':
        return ['active'];
      case 'active':
        return ['paused', 'completed'];
      case 'paused':
        return ['active', 'completed'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      {task.collaborators.map(collaborator => {
        const user = users.find(u => u.id === collaborator.userId);
        if (!user) return null;

        const isCurrentUser = user.id === currentUserId;
        const availableActions = isCurrentUser ? getAvailableActions(collaborator.status) : [];

        return (
          <div
            key={collaborator.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getStatusIcon(collaborator.status)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                  {isCurrentUser && ' (Vous)'}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    getStatusStyle(collaborator.status)
                  }`}>
                    {getStatusLabel(collaborator.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDuration(collaborator.timeSpent)}
                  </span>
                </div>
              </div>
            </div>

            {isCurrentUser && availableActions.length > 0 && (
              <div className="flex space-x-2">
                {availableActions.map(action => (
                  <button
                    key={action}
                    onClick={() => onStatusChange?.(user.id, action)}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      action === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : action === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {getStatusIcon(action)}
                    <span className="ml-1">
                      {action === 'completed' ? 'Terminer'
                        : action === 'active' ? 'Démarrer'
                        : 'Pause'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CollaboratorStatus;