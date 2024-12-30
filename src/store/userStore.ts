import { create } from 'zustand';
import { User } from '../types';
import { userRepository } from '../db/repositories/userRepository';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Partial<User> & { password: string }) => Promise<void>;
  updateUser: (id: string, updates: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userRepository.getAll();
      set({ users, isLoading: false });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs',
        isLoading: false,
        users: [] // Initialize with empty array on error
      });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userRepository.create(userData);
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error creating user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'utilisateur',
        isLoading: false 
      });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userRepository.update(id, updates);
      set(state => ({
        users: state.users.map(user =>
          user.id === id ? updatedUser : user
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'utilisateur',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await userRepository.delete(id);
      set(state => ({
        users: state.users.filter(user => user.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur',
        isLoading: false 
      });
      throw error;
    }
  }
}));