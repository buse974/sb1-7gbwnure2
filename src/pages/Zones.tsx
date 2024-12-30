import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useZoneStore } from '../store/zoneStore';
import ZoneList from '../components/zones/ZoneList';
import ZoneForm from '../components/zones/ZoneForm';
import { Zone } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import DeleteConfirmationModal from '../components/shared/DeleteConfirmationModal';

const Zones: React.FC = () => {
  const { user } = useAuth();
  const { zones = [], isLoading, error, fetchZones, deleteZone } = useZoneStore();
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const loadZones = async () => {
      try {
        await fetchZones();
      } catch (error) {
        console.error('Failed to load zones:', error);
      }
    };

    loadZones();
  }, [fetchZones]);

  const handleEdit = (zone: Zone) => {
    setSelectedZone(zone);
    setShowForm(true);
  };

  const handleDelete = async (zone: Zone) => {
    setZoneToDelete(zone);
  };

  const handleConfirmDelete = async () => {
    if (zoneToDelete) {
      try {
        await deleteZone(zoneToDelete.id);
        setZoneToDelete(null);
      } catch (error) {
        console.error('Failed to delete zone:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedZone(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Zones</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Zone
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ZoneList
        zones={zones}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {showForm && (
        <ZoneForm
          onClose={handleCloseForm}
          editingZone={selectedZone || undefined}
        />
      )}

      {zoneToDelete && (
        <DeleteConfirmationModal
          title="Supprimer la zone"
          message={`Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete.name}" ? Cette action supprimera également toutes les sous-zones associées et est irréversible.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setZoneToDelete(null)}
        />
      )}
    </div>
  );
}

export default Zones;