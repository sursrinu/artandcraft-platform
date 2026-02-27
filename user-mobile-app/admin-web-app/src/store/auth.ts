import { create } from 'zustand';
import apiService from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('adminToken'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(email, password);
      const { data } = response.data;
      localStorage.setItem('adminToken', data.accessToken);
      set({
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          userType: data.userType,
        },
        token: data.accessToken,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiService.logout();
    set({ user: null, token: null });
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      set({ token });
      try {
        const response = await apiService.getProfile();
        const userData = response.data.data;
        set({
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            userType: userData.userType,
          },
        });
      } catch (error) {
        // If profile fetch fails, clear the token
        localStorage.removeItem('adminToken');
        set({ token: null, user: null });
      }
    } else {
      set({ token: null, user: null });
    }
  },
}));
