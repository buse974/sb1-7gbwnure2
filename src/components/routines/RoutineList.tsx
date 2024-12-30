import React from 'react';
import { Routine } from '../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trash2, Loader, Calendar, Clock, Repeat } from 'lucide-react';

interface RoutineListProps {
  routines: Routine[];
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const RoutineList: React.FC<RoutineListProps> = ({ routines, onEdit, onDelete, isLoading }) => {
  const getFrequencyLabel = (frequency: Routine['frequency'], customInterval?: number) => {
    switch (frequency) {
      case 'daily':
        return 'Quotidienne';
      case 'weekly':
        return 'Hebdomadaire';
      case 'monthly':
        return 'Mensuelle';
      case 'custom':
        return `Tous les ${customInterval} jours`;
      default:
        return 'Inconnue';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune routine disponible</p>
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
              Fréquence
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prochaine exécution
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière exécution
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {routines.map((routine) => (
            <tr key={routine.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Repeat className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{routine.title}</div>
                    {routine.description && (
                      <div className="text-sm text-gray-500">{routine.description}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {getFrequencyLabel(routine.frequency, routine.customInterval)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">
                    {format(parseISO(routine.nextExecution), 'Pp', { locale: fr })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {routine.lastExecution ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {format(parseISO(routine.lastExecution), 'Pp', { locale: fr })}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(routine)}
                  className="text-green-600 hover:text-green-900 mr-4"
                  title="Modifier"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(routine.id)}
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

export default RoutineList;