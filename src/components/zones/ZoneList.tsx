import React from 'react';
import { Zone } from '../../types';
import { Edit2, Trash2, Loader, Flag, ChevronDown, ChevronRight } from 'lucide-react';

interface ZoneListProps {
  zones: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ZoneList: React.FC<ZoneListProps> = ({ zones = [], onEdit, onDelete, isLoading }) => {
  const [expandedZones, setExpandedZones] = React.useState<Set<string>>(new Set());
  const [deletingZoneId, setDeletingZoneId] = React.useState<string | null>(null);

  const toggleZone = (zoneId: string) => {
    const newExpanded = new Set(expandedZones);
    if (newExpanded.has(zoneId)) {
      newExpanded.delete(zoneId);
    } else {
      newExpanded.add(zoneId);
    }
    setExpandedZones(newExpanded);
  };

  const handleDelete = async (zone: Zone) => {
    if (deletingZoneId) return; // Prevent multiple deletion attempts

    const message = `Are you sure you want to delete "${zone.name}"?\n\n` +
      (zone.subZones.length > 0 ? `This will also delete:\n- ${zone.subZones.length} sub-zones\n` : '') +
      '- All associated tasks\n' +
      '- All associated routines\n\n' +
      'This action cannot be undone.';

    if (!window.confirm(message)) return;

    setDeletingZoneId(zone.id);
    try {
      await onDelete(zone.id);
    } catch (error) {
      console.error('Failed to delete zone:', error);
      alert('Failed to delete zone. Please try again.');
    } finally {
      setDeletingZoneId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!zones.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No zones available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {zones.map(zone => (
        <div
          key={zone.id}
          className="bg-white shadow rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleZone(zone.id)}
                className="flex items-center space-x-3 flex-1"
              >
                {expandedZones.has(zone.id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <h3 className="text-lg font-medium text-gray-900">
                  {zone.name}
                </h3>
                <span className="text-sm text-gray-500">
                  ({zone.subZones?.length || 0} sub-zones)
                </span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(zone)}
                  className="text-green-600 hover:text-green-900"
                  title="Edit"
                  disabled={deletingZoneId === zone.id}
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(zone)}
                  className={`text-red-600 hover:text-red-900 ${
                    deletingZoneId === zone.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Delete"
                  disabled={deletingZoneId === zone.id}
                >
                  {deletingZoneId === zone.id ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {zone.description && (
              <p className="mt-2 text-sm text-gray-500 ml-12">
                {zone.description}
              </p>
            )}

            {expandedZones.has(zone.id) && zone.subZones?.length > 0 && (
              <div className="mt-4 ml-12">
                <div className="space-y-2">
                  {zone.subZones.map(subZone => (
                    <div
                      key={subZone.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <Flag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {subZone.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subZone.priority === 1 ? 'bg-red-100 text-red-800' :
                          subZone.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Priority {subZone.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ZoneList;