import React from 'react';
import { Task } from '../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Users, Clock } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../shared/StatusBadge';
import StatusButton from '../shared/StatusButton';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { user } = useAuth();
  const { assignTask, completeTask, pauseTask, resumeTask } = useTaskStore();

  const currentCollaborator = task.collaborators.find(c => c.userId === user?.id);
  const activeCollaborators = task.collaborators.filter(c => c.status === 'active').length;
  const totalCollaborators = task.collaborators.length;

  const handleAction = async (action: 'take' | 'complete' | 'pause' | 'resume', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      switch (action) {
        case 'take':
          await assignTask(task.id, user.id);
          break;
        case 'complete':
          await completeTask(task.id, user.id);
          break;
        case 'pause':
          await pauseTask(task.id, user.id);
          break;
        case 'resume':
          await resumeTask(task.id, user.id);
          break;
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const renderActionButtons = () => {
    if (!user || task.status === 'completed') return null;

    if (!currentCollaborator) {
      return (
        <StatusButton
          action="take"
          onClick={(e) => handleAction('take', e)}
        />
      );
    }

    switch (currentCollaborator.status) {
      case 'active':
        return (
          <div className="flex space-x-2">
            <StatusButton
              action="complete"
              onClick={(e) => handleAction('complete', e)}
            />
            <StatusButton
              action="pause"
              onClick={(e) => handleAction('pause', e)}
            />
          </div>
        );
      case 'paused':
        return (
          <div className="flex space-x-2">
            <StatusButton
              action="resume"
              onClick={(e) => handleAction('resume', e)}
            />
            <StatusButton
              action="complete"
              onClick={(e) => handleAction('complete', e)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 min-h-[180px] flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">
              {format(parseISO(task.actionDate), 'Pp', { locale: fr })}
            </span>
          </div>

          {task.deadlineDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                Échéance: {format(parseISO(task.deadlineDate), 'Pp', { locale: fr })}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">
              {totalCollaborators === 0 ? (
                'Aucun collaborateur'
              ) : (
                <>
                  {totalCollaborators} collaborateur{totalCollaborators > 1 ? 's' : ''}
                  {activeCollaborators > 0 && ` (${activeCollaborators} actif${activeCollaborators > 1 ? 's' : ''})`}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end">
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default TaskCard;