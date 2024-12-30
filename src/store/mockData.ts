import { Task, User, Zone, Routine } from '../types';

// Initial admin user only
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Robert Jerome',
    email: 'robertjerome.87@gmail.com',
    role: 'admin',
    createdAt: '1970-01-01T00:00:00.000Z',
    passwordHash: '$2a$10$8KbH7yUH0M0nveKtjHFnkOxBzYk.PO6wWyXyF1dTGhKx9TPFUMp2e' // admin123
  }
];

// Empty initial data
export const mockZones: Zone[] = [];
export const mockTasks: Task[] = [];
export const mockRoutines: Routine[] = [];

// Initialize empty data
export const initializeMockData = () => {
  return {
    users: mockUsers,
    zones: [],
    tasks: [],
    routines: []
  };
};