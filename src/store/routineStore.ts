import { create } from 'zustand';
import { Routine } from '../types';
import { routineRepository } from '../db/repositories/routineRepository';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  fetchRoutines: () => Promise<void>;
  createRoutine: (routine: Partial<Routine>) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  assignRoutine: (routineId: string, userId: string) => Promise<void>;
  completeRoutine: (routineId: string, userId: string) => Promise<void>;
  pauseRoutine: (routineId: string, userId: string) => Promise<void>;
  resumeRoutine: (routineId: string, userId: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  isLoading: false,
  error: null,

  fetchRoutines: async () => {
    set({ isLoading: true, error: null });
    try {
      const routines = await routineRepository.getAll();
      set({ routines, isLoading: false });
    } catch (error) {
      console.error('Error fetching routines:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des routines',
        isLoading: false,
        routines: []
      });
    }
  },

  createRoutine: async (routineData) => {
    set({ isLoading: true, error: null });
    try {
      const newRoutine = await routineRepository.create({
        ...routineData,
        status: 'available',
        createdAt: new Date().toISOString(),
        lastExecution: null
      });

      set(state => ({
        routines: [...state.routines, newRoutine],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error creating routine:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la routine',
        isLoading: false 
      });
      throw error;
    }
  },

  updateRoutine: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRoutine = await routineRepository.update(id, updates);
      set(state => ({
        routines: state.routines.map(routine =>
          routine.id === id ? updatedRoutine : routine
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating routine:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la routine',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteRoutine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await routineRepository.delete(id);
      set(state => ({
        routines: state.routines.filter(routine => routine.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting routine:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la routine',
        isLoading: false 
      });
      throw error;
    }
  },

  assignRoutine: async (routineId, userId) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (!routine) throw new Error('Routine not found');

    const updatedRoutine = {
      ...routine,
      status: 'in-progress',
      routineConfig: {
        ...routine.routineConfig,
        assignedUsers: [
          ...(routine.routineConfig?.assignedUsers || []),
          userId
        ]
      }
    };

    await get().updateRoutine(routineId, updatedRoutine);
  },

  completeRoutine: async (routineId, userId) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (!routine) throw new Error('Routine not found');

    const updatedRoutine = {
      ...routine,
      status: 'completed',
      lastExecution: new Date().toISOString()
    };

    await get().updateRoutine(routineId, updatedRoutine);
  },

  pauseRoutine: async (routineId, userId) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (!routine) throw new Error('Routine not found');

    const updatedRoutine = {
      ...routine,
      status: 'pending'
    };

    await get().updateRoutine(routineId, updatedRoutine);
  },

  resumeRoutine: async (routineId, userId) => {
    const routine = get().routines.find(r => r.id === routineId);
    if (!routine) throw new Error('Routine not found');

    const updatedRoutine = {
      ...routine,
      status: 'in-progress'
    };

    await get().updateRoutine(routineId, updatedRoutine);
  }
}));