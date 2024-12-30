import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { Navigate } from 'react-router-dom';
import { UserPlus, Trash2, Edit, ArrowUpDown } from 'lucide-react';
import UserForm from './users/UserForm';
import { User } from '../types';

type SortField = 'name' | 'takenTasks' | 'completedTasks' | 'inProgressTasks' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const Users: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const tasks = useTaskStore(state => state.tasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleEditUser = (user: Omit<User, 'passwordHash'>) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (userData: {
    email: string;
    password?: string;
    name: string;
    role: 'user' | 'restricted';
  }) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await addUser(userData);
      }
      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignedTo === userId);
    return {
      takenTasks: userTasks.length,
      completedTasks: userTasks.filter(task => task.status === 'completed').length,
      inProgressTasks: userTasks.filter(task => task.status === 'in-progress').length
    };
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;

    const statsA = getUserStats(a.id);
    const statsB = getUserStats(b.id);

    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'takenTasks':
        comparison = statsA.takenTasks - statsB.takenTasks;
        break;
      case 'completedTasks':
        comparison = statsA.completedTasks - statsB.completedTasks;
        break;
      case 'inProgressTasks':
        comparison = statsA.inProgressTasks - statsB.inProgressTasks;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="group inline-flex items-center space-x-1"
    >
      <span>{label}</span>
      <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Ajouter un Utilisateur
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  <SortButton field="name" label="Nom" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  <SortButton field="takenTasks" label="Tâches Prises" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  <SortButton field="completedTasks" label="Tâches Terminées" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  <SortButton field="inProgressTasks" label="Tâches En Cours" />
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => {
                const stats = getUserStats(user.id);
                const roleLabel = user.role === 'admin' ? ' (Admin)' : '';
                
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}{roleLabel}</div>
                      <div className="text-xs text-gray-500">
                        {user.role !== 'admin' && `Créé le ${new Date(user.createdAt).toLocaleDateString()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'user' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' :
                         user.role === 'user' ? 'Accès complet' :
                         'Accès restreint'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.takenTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.completedTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.inProgressTasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <UserForm
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          editingUser={editingUser}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Users;