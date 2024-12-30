import React, { useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { resetAllData } from '../store/resetData';

interface ResetConfirmationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ onClose, onSuccess }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);

    try {
      const result = await resetAllData();
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to reset application data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Réinitialisation Complète
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Cette action va réinitialiser toutes les données de l'application et créer un nouveau jeu de données de simulation. Seul le compte administrateur sera conservé.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmationModal;