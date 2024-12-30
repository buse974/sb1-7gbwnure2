import React from 'react';
import { X, Clock, Calendar, MapPin, Flag, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Routine } from '../../types';
import { useRoutineStore } from '../../store/routineStore';
import { useAuthStore } from '../../store/authStore';
import { useZoneStore } from '../../store/zoneStore';
import StatusBadge from '../shared/StatusBadge';
import FrequencyBadge from '../shared/FrequencyBadge';
import StatusButton from '../shared/StatusButton';
import DetailSection from '../shared/DetailSection';

interface RoutineDetailModalProps {
  routine: Routine;
  onClose: () => void;
}

const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({ routine, onClose }) => {
  const { user } = useAuthStore();
  const { assignRoutine, completeRoutine, pauseRoutine, resumeRoutine } = useRoutineStore();
  const zone = useZoneStore(state => state.zones.find(z => z.id === routine.zoneId));
  const subZone = zone?.subZones.find(sz => sz.id === routine.subZoneId);

  const isAssigned = routine.routineConfig?.assignedUsers?.includes(user?.id || '');

  const handleAction = async (action: 'take' | 'complete' | 'pause' | 'resume') => {
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
          onClick={() => handleAction('take')}
        />
      );
    }

    switch (routine.status) {
      case 'active':
        return (
          <div className="flex space-x-2">
            <StatusButton
              action="complete"
              onClick={() => handleAction('complete')}
            />
            <StatusButton
              action="pause"
              onClick={() => handleAction('pause')}
            />
          </div>
        );
      case 'paused':
        return (
          <div className="flex space-x-2">
            <StatusButton
              action="resume"
              onClick={() => handleAction('resume')}
            />
            <StatusButton
              action="complete"
              onClick={() => handleAction('complete')}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-medium text-gray-900">{routine.title}</h2>
              <StatusBadge status={routine.status} />
            </div>
            <div className="flex items-center mt-1 space-x-2">
              <FrequencyBadge
                frequency={routine.frequency}
                customInterval={routine.customInterval}
              />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Description */}
          {routine.description && (
            <DetailSection title="Description">
              <p className="text-sm text-gray-600">{routine.description}</p>
            </DetailSection>
          )}

          {/* Dates */}
          <DetailSection title="Exécutions">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                  <span className="text-gray-700">Prochaine exécution</span>
                </div>
                <p className="mt-1 text-sm text-gray-900">
                  {format(parseISO(routine.nextExecution), 'Pp', { locale: fr })}
                </p>
              </div>
              {routine.lastExecution && (
                <div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                    <span className="text-gray-700">Dernière exécution</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(parseISO(routine.lastExecution), 'Pp', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Location */}
          <DetailSection title="Localisation">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-1.5" />
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: zone?.color }}
                />
                <span className="text-sm text-gray-900">{zone?.name}</span>
                {subZone && (
                  <>
                    <span className="mx-2">/</span>
                    <div className="flex items-center">
                      <Flag className="h-4 w-4 text-gray-400 mr-1.5" />
                      <span className="text-sm text-gray-900">{subZone.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </DetailSection>

          {/* Collaborators */}
          <DetailSection title="Collaborateurs assignés">
            {routine.routineConfig?.assignedUsers?.length ? (
              <div className="space-y-3">
                {routine.routineConfig.assignedUsers.map(userId => (
                  <div key={userId} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div className="text-sm font-medium text-gray-900">
                      {userId === user?.id ? 'Vous' : userId}
                    </div>
                    {userId === user?.id && (
                      <StatusBadge status={routine.status} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                Aucun collaborateur assigné
              </div>
            )}
          </DetailSection>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Fermer
            </button>
            {renderActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetailModal;