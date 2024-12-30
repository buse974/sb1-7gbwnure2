import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  canManageTasksAndRoutines: boolean;
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        try {
          // Mock login for development
          const mockUser: User = {
            id: '1',
            name: 'Admin User',
            email: email,
            role: 'admin',
            canManageTasksAndRoutines: true
          };
          set({ user: mockUser });
        } catch (error) {
          throw new Error('Login failed');
        }
      },
      logout: () => set({ user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
);