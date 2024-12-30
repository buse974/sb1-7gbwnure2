import React, { useState } from 'react';
import { Map } from 'lucide-react';
import ZoneList from './ZoneList';
import ZoneForm from './ZoneForm';
import { Zone } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ZonesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | undefined>();
  const user = useAuthStore(state => state.user);

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingZone(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Zones</h1>
        {user?.role !== 'restricted' && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <Map className="h-5 w-5 mr-2" />
            Ajouter une Zone
          </button>
        )}
      </div>

      <ZoneList onEditZone={handleEditZone} />

      {isFormOpen && user?.role !== 'restricted' && (
        <ZoneForm 
          onClose={handleCloseForm}
          editingZone={editingZone}
        />
      )}
    </div>
  );
};

export default ZonesPage;