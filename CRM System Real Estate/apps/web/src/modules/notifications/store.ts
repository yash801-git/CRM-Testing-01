import { create } from 'zustand';
import api from '@/services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  fetchAll: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,
  fetchAll: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/notifications');
      const notifications = response.data;
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ loading: false });
    }
  },
  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
  remove: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const notifications = get().notifications.filter(n => n.id !== id);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }
}));
