import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { userRepository } from '../db/repositories/userRepository';

interface AuthState {
  user: Omit<User, 'passwordHash'> | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        try {
          if (!email || !password) {
            throw new Error('Email et mot de passe requis');
          }

          const user = userRepository.findByEmail(email);
          if (!user) {
            throw new Error('Identifiants invalides');
          }

          const bcrypt = require('bcryptjs');
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            throw new Error('Identifiants invalides');
          }

          const { passwordHash, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword });
        } catch (error) {
          console.error('Login error:', error);
          throw error instanceof Error ? error : new Error('Une erreur est survenue lors de la connexion');
        }
      },
      logout: () => set({ user: null })
    }),
    {
      name: 'garden-auth-storage',
      version: 1
    }
  )
);