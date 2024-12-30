import React from 'react';
import { Routine } from '../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Users } from 'lucide-react';
import { useRoutineStore } from '../../store/routineStore';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../shared/StatusBadge';
import StatusButton from '../shared/StatusButton';
import FrequencyBadge from '../shared/FrequencyBadge';

interface RoutineCardProps {
  routine: Routine;
  onClick?: () => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onClick }) => {
  const { user } = useAuth();
  const { assignRoutine, completeRoutine, pauseRoutine, resumeRoutine } = useRoutineStore();

  const isAssigned = routine.routineConfig?.assignedUsers?.includes(user?.id || '');
  const totalCollaborators = routine.routineConfig?.assignedUsers?.length || 0;

  const handleAction = async (action: 'take' | 'complete' | 'pause' | 'resume', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      switch (action) {
        case 'take':
          await assignRoutine(routine.id, user.id);
          break;
        case 'complete':
          await completeRoutine(routine.id, user.id);
          break;
        case 'pause':
          await pauseRoutine(routine.id, user.id);
          break;
        case 'resume':
          await resumeRoutine(routine.id, user.id);
          break;
      }
    } catch (error) {
      console.error('Error updating routine status:', error);
    }
  };

  const renderActionButtons = () => {
    if (!user || routine.status === 'completed') return null;

    if (!isAssigned) {
      return (
        <StatusButton
          action="take"
          onClick={(e) => handleAction('take', e)}
        />
      );
    }

    switch (routine.status) {
      case 'in-progress':
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
      case 'pending':
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
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {routine.title}
          </h3>
          {routine.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{routine.description}</p>
          )}
        </div>
        <StatusBadge status={routine.status} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">
              Prochaine: {format(parseISO(routine.nextExecution), 'Pp', { locale: fr })}
            </span>
          </div>

          {routine.lastExecution && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                Dernière: {format(parseISO(routine.lastExecution), 'Pp', { locale: fr })}
              </span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">
              {totalCollaborators === 0 ? (
                'Aucun collaborateur'
              ) : (
                `${totalCollaborators} collaborateur${totalCollaborators > 1 ? 's' : ''}`
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

export default RoutineCard;