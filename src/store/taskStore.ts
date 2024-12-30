import { create } from 'zustand';
import { Task } from '../types';
import { taskRepository } from '../db/repositories/taskRepository';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  completeTask: (taskId: string, userId: string) => Promise<void>;
  pauseTask: (taskId: string, userId: string) => Promise<void>;
  resumeTask: (taskId: string, userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskRepository.getAll();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des tâches',
        isLoading: false,
        tasks: []
      });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskRepository.create({
        ...taskData,
        status: 'available',
        collaborators: [],
        statusHistory: [{
          status: 'available',
          timestamp: new Date().toISOString()
        }]
      });

      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error creating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création de la tâche',
        isLoading: false 
      });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskRepository.update(id, updates);
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? updatedTask : task
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la tâche',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await taskRepository.delete(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la tâche',
        isLoading: false 
      });
      throw error;
    }
  },

  assignTask: async (taskId, userId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const updatedTask = {
      ...task,
      status: 'in-progress',
      collaborators: [
        ...task.collaborators,
        {
          userId,
          status: 'active',
          joinedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          timeSpent: 0,
          lastStatusChange: new Date().toISOString()
        }
      ],
      statusHistory: [
        ...task.statusHistory,
        {
          status: 'in-progress',
          timestamp: new Date().toISOString(),
          userId
        }
      ]
    };

    await get().updateTask(taskId, updatedTask);
  },

  completeTask: async (taskId, userId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const updatedCollaborators = task.collaborators.map(collab =>
      collab.userId === userId
        ? { ...collab, status: 'completed' as const }
        : collab
    );

    const allCompleted = updatedCollaborators.every(c => c.status === 'completed');

    const updatedTask = {
      ...task,
      status: allCompleted ? 'completed' : task.status,
      collaborators: updatedCollaborators,
      statusHistory: [
        ...task.statusHistory,
        {
          status: allCompleted ? 'completed' : task.status,
          timestamp: new Date().toISOString(),
          userId
        }
      ]
    };

    await get().updateTask(taskId, updatedTask);
  },

  pauseTask: async (taskId, userId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const updatedCollaborators = task.collaborators.map(collab =>
      collab.userId === userId
        ? { ...collab, status: 'paused' as const }
        : collab
    );

    const updatedTask = {
      ...task,
      status: 'pending',
      collaborators: updatedCollaborators,
      statusHistory: [
        ...task.statusHistory,
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          userId
        }
      ]
    };

    await get().updateTask(taskId, updatedTask);
  },

  resumeTask: async (taskId, userId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const updatedCollaborators = task.collaborators.map(collab =>
      collab.userId === userId
        ? { 
            ...collab, 
            status: 'active' as const,
            startedAt: new Date().toISOString()
          }
        : collab
    );

    const updatedTask = {
      ...task,
      status: 'in-progress',
      collaborators: updatedCollaborators,
      statusHistory: [
        ...task.statusHistory,
        {
          status: 'in-progress',
          timestamp: new Date().toISOString(),
          userId
        }
      ]
    };

    await get().updateTask(taskId, updatedTask);
  }
}));