import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import DeleteConfirmationModal from '../components/shared/DeleteConfirmationModal';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Users = () => {
  const { user } = useAuth();
  const { users, isLoading, error, fetchUsers, deleteUser } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUserToDelete(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Utilisateur
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
        <UserList
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>

      {showForm && (
        <UserForm
          onClose={handleCloseForm}
          editingUser={selectedUser || undefined}
        />
      )}

      {userToDelete && (
        <DeleteConfirmationModal
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete.name}" ? Cette action est irréversible.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};

export default Users;