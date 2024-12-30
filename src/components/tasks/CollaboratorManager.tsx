import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, AlertTriangle, Clock } from 'lucide-react';
import { Task, User, Collaborator } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDuration } from '../../utils/formatters';

interface CollaboratorManagerProps {
  task: Task;
  users: User[];
  currentUser: Omit<User, 'passwordHash'>;
  onCollaboratorUpdate?: (updatedTask: Task) => void;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({
  task,
  users,
  currentUser,
  onCollaboratorUpdate
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    addCollaborator,
    removeCollaborator,
    getCurrentInProgressTask,
    getPausedTasksCount
  } = useTaskStore();

  const collaborators = task.collaborators || [];

  const handleAddCollaborator = async () => {
    if (!selectedUserId) {
      setError('Veuillez sélectionner un collaborateur');
      return;
    }

    const currentTask = getCurrentInProgressTask(selectedUserId);
    if (currentTask) {
      const pausedCount = getPausedTasksCount(selectedUserId);
      setError(
        `Ce collaborateur a déjà une tâche en cours${
          pausedCount > 0 ? ` et ${pausedCount} tâche${pausedCount > 1 ? 's' : ''} en pause` : ''
        }`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addCollaborator(task.id, selectedUserId);
      const newCollaborator: Collaborator = {
        userId: selectedUserId,
        status: 'assigned',
        joinedAt: new Date().toISOString(),
        timeSpent: 0,
        lastStatusChange: new Date().toISOString()
      };
      const updatedTask = {
        ...task,
        collaborators: [...(task.collaborators || []), newCollaborator]
      };
      onCollaboratorUpdate?.(updatedTask);
      setShowAddForm(false);
      setSelectedUserId('');
      setError(null);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'ajout du collaborateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer ce collaborateur ?')) {
      try {
        await removeCollaborator(task.id, userId);
        const updatedTask = {
          ...task,
          collaborators: task.collaborators.filter(c => c.userId !== userId)
        };
        onCollaboratorUpdate?.(updatedTask);
      } catch (err) {
        setError('Une erreur est survenue lors du retrait du collaborateur');
      }
    }
  };

  const getStatusLabel = (status: Collaborator['status']) => {
    switch (status) {
      case 'assigned':
        return 'Assigné';
      case 'active':
        return 'Actif';
      case 'paused':
        return 'En pause';
      case 'completed':
        return 'Terminé';
      default:
        return '';
    }
  };

  const getStatusStyle = (status: Collaborator['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const availableUsers = users.filter(user =>
    !collaborators.some(collab => collab.userId === user.id) &&
    user.role !== 'admin'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Collaborateurs
          </div>
        </h3>
        {!showAddForm && currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Ajouter
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sélectionner un collaborateur
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setError(null);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="">Choisir un collaborateur...</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedUserId('');
                setError(null);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAddCollaborator}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⌛</span>
                  Ajout...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {collaborators.length > 0 ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Collaborateur
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Temps actif
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase">
                  Depuis
                </th>
                {currentUser.role === 'admin' && (
                  <th scope="col" className="relative py-3.5 pl-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {collaborators.map(collaborator => {
                const user = users.find(u => u.id === collaborator.userId);
                if (!user) return null;

                const activeTime = collaborator.startedAt ? 
                  Math.floor((new Date().getTime() - parseISO(collaborator.startedAt).getTime()) / 60000) : 
                  0;

                return (
                  <tr key={collaborator.userId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusStyle(collaborator.status)
                      }`}>
                        {getStatusLabel(collaborator.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                        {formatDuration(collaborator.timeSpent + (collaborator.status === 'active' ? activeTime : 0))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(collaborator.joinedAt), 'Pp', { locale: fr })}
                    </td>
                    {currentUser.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">Aucun collaborateur</p>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter un collaborateur
          </p>
        </div>
      )}
    </div>
  );
};

export default CollaboratorManager;