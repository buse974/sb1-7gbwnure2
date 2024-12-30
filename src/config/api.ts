export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  endpoints: {
    tasks: '/tasks',
    routines: '/routines',
    users: '/users',
    zones: '/zones',
    auth: '/auth'
  }
} as const;