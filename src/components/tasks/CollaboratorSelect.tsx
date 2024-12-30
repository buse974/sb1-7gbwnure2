import React from 'react';
import { User } from '../../types';
import { Users } from 'lucide-react';

interface CollaboratorSelectProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const CollaboratorSelect: React.FC<CollaboratorSelectProps> = ({
  users,
  selectedIds,
  onChange,
  disabled,
  error
}) => {
  const availableUsers = users.filter(user => user.role !== 'admin');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const newSelectedIds = selectedOptions.map(option => option.value);
    onChange(newSelectedIds);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Collaborateurs
      </label>
      <div className="relative">
        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          multiple
          value={selectedIds}
          onChange={handleChange}
          className={`pl-10 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm min-h-[120px]
            ${error ? 'border-red-300' : 'border-gray-300'}`}
          disabled={disabled}
        >
          {availableUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-2 text-sm text-gray-500">
        Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs collaborateurs.
        Si aucun collaborateur n'est sélectionné, la tâche sera marquée comme disponible.
      </p>
    </div>
  );
};

export default CollaboratorSelect;