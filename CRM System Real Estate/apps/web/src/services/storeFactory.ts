import { create } from 'zustand';
import api from '@/services/api';

export interface CrudState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  fetchAll: (force?: boolean, page?: number, limit?: number) => Promise<void>;
  add: (item: Partial<T>) => Promise<void>;
  update: (id: string, item: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const createCrudStore = <T extends { id: string }>(endpoint: string) => 
  create<CrudState<T>>((set, get) => ({
    data: [],
    loading: false,
    error: null,
    initialized: false,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    fetchAll: async (force = false, page, limit) => {
      if (get().initialized && !force && !page) return;
      set({ loading: true });
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      const params: any = {};
      if (page) params.page = page;
      if (limit) params.limit = limit;

      try {
        const response = await api.get(path, { params });
        
        // Handle both paginated and non-paginated responses
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          set({ 
            data: response.data.data, 
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
            totalPages: response.data.totalPages,
            loading: false, 
            initialized: true, 
            error: null 
          });
        } else {
          set({ 
            data: Array.isArray(response.data) ? response.data : [], 
            loading: false, 
            initialized: true, 
            error: null 
          });
        }
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },
    add: async (item) => {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      try {
        const response = await api.post(path, item);
        set({ data: [...get().data, response.data] });
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      }
    },
    update: async (id, item) => {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      try {
        const response = await api.patch(`${path}/${id}`, item);
        set({ 
          data: get().data.map(i => i.id === id ? response.data : i) 
        });
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      }
    },
    remove: async (id) => {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      try {
        await api.delete(`${path}/${id}`);
        set({ 
          data: get().data.filter(i => i.id !== id) 
        });
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      }
    }
  }));
