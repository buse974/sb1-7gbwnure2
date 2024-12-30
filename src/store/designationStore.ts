import { create } from 'zustand';
import { TaskDesignation } from '../types';
import { designationRepository } from '../db/repositories/designationRepository';

interface DesignationState {
  designations: TaskDesignation[];
  isLoading: boolean;
  error: string | null;
  fetchDesignations: () => Promise<void>;
  createDesignation: (title: string) => Promise<void>;
  updateDesignation: (id: string, title: string) => Promise<void>;
  deleteDesignation: (id: string) => Promise<void>;
}

export const useDesignationStore = create<DesignationState>((set) => ({
  designations: [],
  isLoading: false,
  error: null,

  fetchDesignations: async () => {
    set({ isLoading: true, error: null });
    try {
      const designations = await designationRepository.getAll();
      set({ designations, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load designations';
      set({ error: errorMessage, isLoading: false, designations: [] });
    }
  },

  createDesignation: async (title) => {
    set({ isLoading: true, error: null });
    try {
      const newDesignation = await designationRepository.create(title);
      set(state => ({
        designations: [...state.designations, newDesignation],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create designation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateDesignation: async (id, title) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDesignation = await designationRepository.update(id, title);
      set(state => ({
        designations: state.designations.map(d => 
          d.id === id ? updatedDesignation : d
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update designation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteDesignation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await designationRepository.delete(id);
      set(state => ({
        designations: state.designations.filter(d => d.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete designation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  }
}));