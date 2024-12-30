import { useAuthStore } from './authStore';
import { useTaskStore } from './taskStore';
import { useZoneStore } from './zoneStore';
import { useDesignationStore } from './designationStore';
import { initializeData } from './initializeData';

export const resetAllData = async () => {
  try {
    // Clear all localStorage data except admin user
    const adminUser = JSON.parse(localStorage.getItem('garden-users') || '[]')[0];
    localStorage.clear();
    if (adminUser) {
      localStorage.setItem('garden-users', JSON.stringify([adminUser]));
    }

    // Reset all stores
    const taskStore = useTaskStore.getState();
    const zoneStore = useZoneStore.getState();
    const designationStore = useDesignationStore.getState();

    // Reset individual stores
    taskStore.resetTasks();
    zoneStore.resetZones();
    designationStore.resetDesignations();

    // Clear initialization flags
    localStorage.removeItem('data-initialized');

    // Force reload the auth state
    const authStore = useAuthStore.getState();
    if (authStore.user?.role !== 'admin') {
      authStore.logout();
    }

    // Initialize new data
    await initializeData();

    return { success: true };
  } catch (error) {
    console.error('Failed to reset application data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};