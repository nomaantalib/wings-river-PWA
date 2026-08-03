'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, X, AlertTriangle, Info, XCircle, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextValue {
  notify: (n: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within GlobalNotificationSystem');
  return ctx;
}

const ICONS: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  info:    <Info className="w-5 h-5 text-sky-400 shrink-0" />,
};

const BORDER_COLORS: Record<NotificationType, string> = {
  success: 'border-emerald-500/40',
  error:   'border-rose-500/40',
  warning: 'border-amber-500/40',
  info:    'border-sky-500/40',
};

const BG_COLORS: Record<NotificationType, string> = {
  success: 'bg-emerald-900/40',
  error:   'bg-rose-900/40',
  warning: 'bg-amber-900/40',
  info:    'bg-sky-900/40',
};

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl
        transition-all duration-300 ease-out
        ${BORDER_COLORS[notification.type]} ${BG_COLORS[notification.type]}
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        max-w-sm w-full cursor-pointer`}
      onClick={onDismiss}
      role="alert"
    >
      {ICONS[notification.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-white/65 mt-0.5 leading-relaxed">{notification.message}</p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="shrink-0 text-white/40 hover:text-white/80 transition-colors mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function GlobalNotificationSystem({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((n: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = n.duration ?? 4000;
    setNotifications(prev => [{ ...n, id }, ...prev].slice(0, 5));
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => notify({ type: 'success', title, message }), [notify]);
  const error   = useCallback((title: string, message?: string) => notify({ type: 'error',   title, message }), [notify]);
  const warning = useCallback((title: string, message?: string) => notify({ type: 'warning', title, message }), [notify]);
  const info    = useCallback((title: string, message?: string) => notify({ type: 'info',    title, message }), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, dismiss, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-20 right-4 z-[500] flex flex-col gap-2.5 pointer-events-none"
      >
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <Toast notification={n} onDismiss={() => dismiss(n.id)} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
