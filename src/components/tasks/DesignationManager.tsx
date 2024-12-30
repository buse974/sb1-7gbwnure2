import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus } from 'lucide-react';
import { useDesignationStore } from '../../store/designationStore';

interface DesignationManagerProps {
  onClose: () => void;
}

const DesignationManager: React.FC<DesignationManagerProps> = ({ onClose }) => {
  const { 
    designations, 
    isLoading,
    error,
    fetchDesignations,
    createDesignation,
    updateDesignation,
    deleteDesignation 
  } = useDesignationStore();

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const title = newTitle.trim();
    if (!title) {
      setFormError('Title is required');
      return;
    }

    try {
      await createDesignation(title);
      setNewTitle('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create designation');
    }
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
    setFormError('');
  };

  const handleSaveEdit = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) {
      setFormError('Title is required');
      return;
    }

    try {
      await updateDesignation(id, title);
      setEditingId(null);
      setEditingTitle('');
      setFormError('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update designation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this designation?')) {
      return;
    }

    try {
      await deleteDesignation(id);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to delete designation');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Manage Designations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New designation"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {formError && (
            <p className="mt-1 text-sm text-red-600">{formError}</p>
          )}
        </form>

        <div className="space-y-2">
          {designations.map(designation => (
            <div
              key={designation.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              {editingId === designation.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 mr-2 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(designation.id);
                    }
                  }}
                />
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {designation.title}
                </span>
              )}

              <div className="flex items-center space-x-2">
                {editingId === designation.id ? (
                  <button
                    onClick={() => handleSaveEdit(designation.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(designation.id, designation.title)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(designation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {!isLoading && designations.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">
              No designations created yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignationManager;