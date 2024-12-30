import React from 'react';
import { Zone, User } from '../../types';
import { Calendar, MapPin, Users } from 'lucide-react';

interface StatisticsFiltersProps {
  filters: {
    timeRange: 'week' | 'month' | 'year';
    zoneId?: string;
    subZoneId?: string;
    userId?: string;
  };
  onFilterChange: (filters: any) => void;
  zones: Zone[];
  users: User[];
}

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  filters,
  onFilterChange,
  zones,
  users
}) => {
  const handleChange = (name: string, value: string) => {
    if (name === 'zoneId' && value !== filters.zoneId) {
      // Reset subZoneId when zone changes
      onFilterChange({ ...filters, [name]: value, subZoneId: undefined });
    } else {
      onFilterChange({ ...filters, [name]: value });
    }
  };

  const selectedZone = zones.find(zone => zone.id === filters.zoneId);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filters.timeRange}
              onChange={(e) => handleChange('timeRange', e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filters.zoneId || ''}
              onChange={(e) => handleChange('zoneId', e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="">Toutes les zones</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sous-zone
          </label>
          <select
            value={filters.subZoneId || ''}
            onChange={(e) => handleChange('subZoneId', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={!selectedZone}
          >
            <option value="">Toutes les sous-zones</option>
            {selectedZone?.subZones.map(subZone => (
              <option key={subZone.id} value={subZone.id}>
                {subZone.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collaborateur
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filters.userId || ''}
              onChange={(e) => handleChange('userId', e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
    </div>
  );
};

export default StatisticsFilters;