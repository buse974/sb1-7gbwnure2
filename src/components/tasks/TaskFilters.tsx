import React from 'react';
import { Filter, X } from 'lucide-react';
import { useZoneStore } from '../../store/zoneStore';
import { useUserStore } from '../../store/userStore';

interface TaskFiltersProps {
  filters: {
    status: string[];
    zoneId?: string;
    subZoneId?: string;
    collaboratorId?: string;
    dateRange?: 'today' | 'week' | 'month' | 'all';
    showRoutines: boolean;
    showTasks: boolean;
  };
  onChange: (filters: any) => void;
  onClose: () => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onChange, onClose }) => {
  const zones = useZoneStore(state => state.zones);
  const users = useUserStore(state => state.users);
  const selectedZone = zones.find(zone => zone.id === filters.zoneId);

  const handleChange = (name: string, value: any) => {
    if (name === 'zoneId' && value !== filters.zoneId) {
      onChange({ ...filters, [name]: value, subZoneId: undefined });
    } else if (name === 'status') {
      const newStatuses = filters.status.includes(value)
        ? filters.status.filter(s => s !== value)
        : [...filters.status, value];
      onChange({ ...filters, status: newStatuses });
    } else {
      onChange({ ...filters, [name]: value });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filtres
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Type de contenu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de contenu
          </label>
          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.showTasks}
                onChange={(e) => handleChange('showTasks', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Tâches</span>
            </label>
            <br />
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filters.showRoutines}
                onChange={(e) => handleChange('showRoutines', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Routines</span>
            </label>
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <div className="space-y-2">
            {['available', 'in-progress', 'pending', 'completed'].map(status => (
              <label key={status} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleChange('status', status)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {status === 'available' && 'Disponible'}
                  {status === 'in-progress' && 'En cours'}
                  {status === 'pending' && 'En pause'}
                  {status === 'completed' && 'Terminé'}
                </span>
                <br />
              </label>
            ))}
          </div>
        </div>

        {/* Période */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>

        {/* Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone
          </label>
          <select
            value={filters.zoneId || ''}
            onChange={(e) => handleChange('zoneId', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Toutes les zones</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>

        {/* Sous-zone */}
        {selectedZone && selectedZone.subZones.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-zone
            </label>
            <select
              value={filters.subZoneId || ''}
              onChange={(e) => handleChange('subZoneId', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="">Toutes les sous-zones</option>
              {selectedZone.subZones.map(subZone => (
                <option key={subZone.id} value={subZone.id}>
                  {subZone.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Collaborateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collaborateur
          </label>
          <select
            value={filters.collaboratorId || ''}
            onChange={(e) => handleChange('collaboratorId', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Tous les collaborateurs</option>
            {users
              .filter(user => user.role !== 'admin')
              .map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;