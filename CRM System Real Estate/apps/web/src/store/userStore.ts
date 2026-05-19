import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'BROKER' | 'AGENT';
  phone?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  error: null,
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/users/me');
      set({ user: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
