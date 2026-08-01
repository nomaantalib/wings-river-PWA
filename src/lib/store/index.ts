/**
 * Wings River Café - Global Store Scaffolding (Zustand pattern)
 * Module 1 Foundation Architecture
 */

import { UserRole } from '../theme';

export interface UserSession {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  token?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

// 1. Auth Store Scaffolding
export const createAuthStore = () => {
  let currentUser: UserSession | null = null;
  const listeners: Set<() => void> = new Set();

  return {
    getUser: () => currentUser,
    setUser: (user: UserSession | null) => {
      currentUser = user;
      if (user?.token && typeof window !== 'undefined') {
        localStorage.setItem('wings_auth_token', user.token);
      }
      listeners.forEach(fn => fn());
    },
    logout: () => {
      currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wings_auth_token');
      }
      listeners.forEach(fn => fn());
    },
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
};

export const authStore = createAuthStore();

// 2. Notification Toast Engine Store
export const createNotificationStore = () => {
  let toasts: ToastMessage[] = [];
  const listeners: Set<() => void> = new Set();

  return {
    getToasts: () => toasts,
    addToast: (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      toasts = [...toasts, { ...toast, id }];
      listeners.forEach(fn => fn());

      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        listeners.forEach(fn => fn());
      }, 4000);
    },
    removeToast: (id: string) => {
      toasts = toasts.filter(t => t.id !== id);
      listeners.forEach(fn => fn());
    },
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
};

export const notificationStore = createNotificationStore();
