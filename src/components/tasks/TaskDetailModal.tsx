import React from 'react';
import { X, Clock, Calendar, MapPin, Flag, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useZoneStore } from '../../store/zoneStore';
import StatusBadge from '../shared/StatusBadge';
import StatusButton from '../shared/StatusButton';
import DetailSection from '../shared/DetailSection';
import { formatDuration } from '../../utils/formatters';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { user } = useAuthStore();
  const { assignTask, completeTask, pauseTask, resumeTask } = useTaskStore();
  const zone = useZoneStore(state => state.zones.find(z => z.id === task.zoneId));
  const subZone = zone?.subZones.find(sz => sz.id === task.subZoneId);

  const currentCollaborator = task.collaborators.find(c => c.userId === user?.id);
  const activeCollaborators = task.collaborators.filter(c => c.status === 'active').length;
  const completedCollaborators = task.collaborators.filter(c => c.status === 'completed').length;

  const handleAction = async (action: 'take' | 'complete' | 'pause' | 'resume') => {
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
          onClick={() => handleAction('take')}
        />
      );
    }

    switch (currentCollaborator.status) {
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

  const getProgressLabel = () => {
    if (task.status === 'completed') {
      return 'Tâche terminée';
    }
    if (activeCollaborators > 0) {
      return `${activeCollaborators} collaborateur${activeCollaborators > 1 ? 's' : ''} actif${activeCollaborators > 1 ? 's' : ''}`;
    }
    if (completedCollaborators > 0) {
      return `${completedCollaborators} collaborateur${completedCollaborators > 1 ? 's' : ''} terminé${completedCollaborators > 1 ? 's' : ''}`;
    }
    return 'Tâche disponible';
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-medium text-gray-900">{task.title}</h2>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">{getProgressLabel()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Description */}
          {task.description && (
            <DetailSection title="Description">
              <p className="text-sm text-gray-600">{task.description}</p>
            </DetailSection>
          )}

          {/* Dates */}
          <DetailSection title="Dates">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                  <span className="text-gray-700">Date d'action</span>
                </div>
                <p className="mt-1 text-sm text-gray-900">
                  {format(parseISO(task.actionDate), 'Pp', { locale: fr })}
                </p>
              </div>
              {task.deadlineDate && (
                <div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
                    <span className="text-gray-700">Date limite</span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    {format(parseISO(task.deadlineDate), 'Pp', { locale: fr })}
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
          <DetailSection title={`Collaborateurs (${task.collaborators.length})`}>
            {task.collaborators.length > 0 ? (
              <div className="space-y-3">
                {task.collaborators.map(collaborator => (
                  <div key={collaborator.userId} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {collaborator.userId === user?.id ? 'Vous' : collaborator.userId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(collaborator.timeSpent)}
                      </div>
                    </div>
                    <StatusBadge status={collaborator.status} />
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

export default TaskDetailModal;