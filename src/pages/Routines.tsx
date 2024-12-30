import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useRoutineStore } from '../store/routineStore';
import RoutineList from '../components/routines/RoutineList';
import RoutineForm from '../components/routines/RoutineForm';
import { Routine } from '../types';

const Routines = () => {
  const { routines, isLoading, error, fetchRoutines, deleteRoutine } = useRoutineStore();
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadRoutines = async () => {
      try {
        await fetchRoutines();
      } catch (error) {
        console.error('Failed to load routines:', error);
      }
    };

    loadRoutines();
  }, [fetchRoutines]);

  const handleEdit = (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette routine ?')) {
      try {
        await deleteRoutine(id);
      } catch (error) {
        console.error('Failed to delete routine:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRoutine(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Routines</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Routine
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <RoutineList
          routines={routines}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {showForm && (
        <RoutineForm
          onClose={handleCloseForm}
          editingRoutine={selectedRoutine || undefined}
        />
      )}
    </div>
  );
};

export default Routines;