import { create } from 'zustand';
import { authApi } from '../api';
import { tokenStorage } from '../api/client';
import type { RegisterRequest, User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        // Try to get user profile with existing token
        const user = await authApi.getProfile();
        set({ user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      // Token might be expired or invalid
      await tokenStorage.clearTokens();
      set({ isInitialized: true, isAuthenticated: false, user: null });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(data);
      set({ isLoading: false });
      // After registration, user needs to login
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
