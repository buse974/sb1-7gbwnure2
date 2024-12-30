import { addUserToAuth, getUsersFromAuth } from './authStore';

// Preserve only admin user
export const seedUsers = async () => {
  const existingUsers = getUsersFromAuth();
  
  // Ensure admin user exists
  if (!existingUsers.some(u => u.email === 'robertjerome.87@gmail.com')) {
    try {
      await addUserToAuth(
        'robertjerome.87@gmail.com',
        'admin123',
        'Robert Jerome',
        'admin'
      );
    } catch (error) {
      console.error('Failed to create admin user:', error);
    }
  }
};

// Empty initial data
export const initialZones = [];
export const initialDesignations = [];
export const getInitialTasks = () => [];
export const generateHistoricalData = () => [];