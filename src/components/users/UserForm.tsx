import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';
import { useUserStore } from '../../store/userStore';

interface UserFormProps {
  onClose: () => void;
  editingUser?: User;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, editingUser }) => {
  const [formData, setFormData] = useState({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    password: '',
    canManageTasksAndRoutines: editingUser?.canManageTasksAndRoutines || false
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createUser, updateUser } = useUserStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }

    if (!editingUser && !formData.password) {
      setError('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: 'user' as const,
        ...((!editingUser || formData.password) && { password: formData.password })
      };

      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={isSubmitting}
              required={!editingUser}
            />
          </div>

          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="canManageTasksAndRoutines"
                name="canManageTasksAndRoutines"
                type="checkbox"
                checked={formData.canManageTasksAndRoutines}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="canManageTasksAndRoutines" className="font-medium text-gray-700">
                Permission de gérer les tâches et routines
              </label>
              <p className="text-gray-500">
                Permet de créer, modifier et supprimer des tâches et des routines
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : (editingUser ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;