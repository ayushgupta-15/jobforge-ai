import { create } from 'zustand';
import { authService, User, LoginData, RegisterData } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(data);
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      await get().login({ email: data.email, password: data.password });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  fetchUser: async () => {
    // Check if tokens exist before making request
    if (typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('access_token');
      if (!hasToken) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error: any) {
      // If fetch fails, clear tokens and set unauthenticated
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.detail || 'Session expired',
      });
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
}));