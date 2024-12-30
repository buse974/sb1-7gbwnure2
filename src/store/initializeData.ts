import { useUserStore } from './userStore';
import { useZoneStore } from './zoneStore';
import { useTaskStore } from './taskStore';
import { useRoutineStore } from './routineStore';
import { initializeMockData } from './mockData';

export const initializeData = async () => {
  try {
    // Check if data is already initialized
    const isInitialized = localStorage.getItem('data-initialized');
    if (isInitialized === 'true') {
      console.log('Data already initialized');
      return;
    }

    console.log('Initializing empty system...');
    const { users } = initializeMockData();

    // Get store actions
    const userStore = useUserStore.getState();

    // Initialize admin user only
    await Promise.all(users.map(async user => {
      try {
        await userStore.createUser(user);
      } catch (error) {
        console.warn('Failed to create admin user:', error);
      }
    }));

    // Mark data as initialized
    localStorage.setItem('data-initialized', 'true');
    console.log('System initialized successfully');
  } catch (error) {
    console.error('Failed to initialize system:', error);
  }
};