import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { id: string; username: string; email: string; role: string; customerId: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user'], token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
      setToken: (token) => set({ token }), // Update token only
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;