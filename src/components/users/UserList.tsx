import React from 'react';
import { User } from '../../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit2, Trash2, Loader, CheckCircle, XCircle } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({ users = [], onEdit, onDelete, isLoading }) => {
  const getRoleBadgeStyle = (role: User['role']) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  const getRoleLabel = (role: User['role']) => {
    return role === 'admin' ? 'Administrateur' : 'Utilisateur';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'Pp', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun utilisateur disponible</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission Tâches
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de création
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.role === 'admin' ? (
                  <span className="text-purple-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Administrateur
                  </span>
                ) : user.canManageTasksAndRoutines ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Oui
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Non
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {user.role !== 'admin' && (
                  <>
                    <button
                      onClick={() => onEdit(user)}
                      className="text-green-600 hover:text-green-900 mr-4"
                      title="Modifier"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;