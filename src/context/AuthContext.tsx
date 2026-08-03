'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'Customer' | 'Waiter' | 'Manager' | 'Admin' | 'Administrator';

export interface UserSessionData {
  id: string;
  username?: string;
  phone?: string;
  email?: string;
  name?: string;
  role: UserRole;
  loggedInAt?: string;
}

interface AuthContextType {
  user: UserSessionData | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  sendOtp: (phone: string, email: string) => Promise<{ success: boolean; error?: string; dev_otp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomerOtp: (phone: string, otp: string, name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  loginCustomerWidgetToken: (token: string, phone: string, name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  loginStaff: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'wings_access_token';
const REFRESH_TOKEN_KEY = 'wings_refresh_token';
const USER_SESSION_KEY = 'wings_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSessionData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync customer auth state from LocalStorage
  const loadStoredAuth = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
      const storedCustomerRaw = localStorage.getItem('wings_customer_session') || localStorage.getItem(USER_SESSION_KEY);

      if (storedCustomerRaw) {
        const parsedUser = JSON.parse(storedCustomerRaw);
        // Only load if it's a customer session
        if (parsedUser && !['Waiter', 'Manager', 'Admin', 'Administrator', 'Kitchen', 'Billing', 'Staff'].includes(parsedUser.role)) {
          setAccessToken(storedAccess || null);
          setRefreshToken(storedRefresh || null);
          setUser(parsedUser);
          return;
        }
      }
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (e) {
      console.warn('[AuthContext loadStoredAuth Exception]', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
    const handleAuthChange = () => loadStoredAuth();
    window.addEventListener('wings_customer_auth_change', handleAuthChange);
    window.addEventListener('wings_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('wings_customer_auth_change', handleAuthChange);
      window.removeEventListener('wings_auth_change', handleAuthChange);
    };
  }, [loadStoredAuth]);

  // Helper to persist auth data with strict role-based storage isolation
  const persistAuth = (accToken: string, refToken: string, userData: UserSessionData) => {
    if (typeof window === 'undefined') return;

    if (userData.role === 'Customer') {
      const custSession = {
        id: userData.id || userData.phone,
        phone: userData.phone || '',
        name: userData.name || userData.username || 'Customer',
        email: userData.email,
        role: 'Customer',
        loggedIn: true,
        loggedInAt: userData.loggedInAt || new Date().toISOString()
      };
      localStorage.setItem('wings_customer_session', JSON.stringify(custSession));
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(custSession));
      localStorage.setItem(ACCESS_TOKEN_KEY, accToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refToken);
      setAccessToken(accToken);
      setRefreshToken(refToken);
      setUser(userData);
      window.dispatchEvent(new Event('wings_customer_auth_change'));
      window.dispatchEvent(new Event('wings_auth_change'));
    } else if (['Waiter', 'Manager', 'Kitchen', 'Billing', 'Staff'].includes(userData.role)) {
      // Store staff session completely isolated
      const staffSession = {
        ...userData,
        loggedInAt: userData.loggedInAt || new Date().toISOString()
      };
      localStorage.setItem('wings_staff_session', JSON.stringify(staffSession));
      localStorage.setItem('wings_staff_jwt', accToken);
      window.dispatchEvent(new Event('wings_staff_auth_change'));
    } else if (['Admin', 'Administrator'].includes(userData.role)) {
      // Store admin session completely isolated
      const adminSession = {
        ...userData,
        role: 'Admin',
        loggedInAt: userData.loggedInAt || new Date().toISOString()
      };
      localStorage.setItem('wings_admin_session', JSON.stringify(adminSession));
      localStorage.setItem('wings_admin_jwt', accToken);
      localStorage.setItem('wings_admin_auth', 'true');
      window.dispatchEvent(new Event('wings_admin_auth_change'));
    }
  };

  // Helper to clear customer auth data
  const clearAuth = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('wings_customer_session');
    localStorage.removeItem(USER_SESSION_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    window.dispatchEvent(new Event('wings_customer_auth_change'));
    window.dispatchEvent(new Event('wings_auth_change'));
  }, []);

  // 1. Send OTP
  const sendOtp = async (phone: string, email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return { success: true, dev_otp: data.data?.dev_otp || data.dev_otp };
      }
      return { success: false, error: data.error || data.message || 'Failed to send OTP' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 2. Verify OTP
  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        if (payload.accessToken && payload.user) {
          persistAuth(payload.accessToken, payload.refreshToken, {
            ...payload.user,
            role: 'Customer',
            loggedInAt: new Date().toISOString()
          });
        }
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Invalid OTP code' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 3. Customer OTP Login
  const loginCustomerOtp = async (phone: string, otp: string, name?: string, email?: string) => {
    try {
      const res = await fetch('/api/auth/customer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        persistAuth(payload.accessToken, payload.refreshToken, {
          ...payload.user,
          role: 'Customer',
          loggedInAt: new Date().toISOString()
        });
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Customer login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 3b. Customer MSG91 Widget Verification Login
  const loginCustomerWidgetToken = async (token: string, phone: string, name?: string, email?: string) => {
    try {
      const res = await fetch('/api/auth/verify-widget-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phone, name, email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        persistAuth(payload.accessToken, payload.refreshToken, {
          ...payload.user,
          role: 'Customer',
          loggedInAt: new Date().toISOString()
        });
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Widget login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 4. Staff Login
  const loginStaff = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        persistAuth(payload.accessToken, payload.refreshToken, {
          ...payload.user,
          loggedInAt: new Date().toISOString()
        });
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Staff login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 5. Admin Login
  const loginAdmin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        persistAuth(payload.accessToken, payload.refreshToken, {
          ...payload.user,
          role: 'Admin',
          loggedInAt: new Date().toISOString()
        });
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Admin login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection error' };
    }
  };

  // 6. Refresh Token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const curRefToken = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null);
    if (!curRefToken) {
      clearAuth();
      return false;
    }
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: curRefToken })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const payload = data.data || data;
        persistAuth(payload.accessToken, payload.refreshToken, {
          ...payload.user,
          loggedInAt: new Date().toISOString()
        });
        return true;
      }
      clearAuth();
      return false;
    } catch {
      clearAuth();
      return false;
    }
  }, [refreshToken, clearAuth]);

  // 7. Logout
  const logout = async () => {
    const curRefToken = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null);
    const curAccToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null);
    if (curRefToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(curAccToken ? { Authorization: `Bearer ${curAccToken}` } : {})
        },
        body: JSON.stringify({ refreshToken: curRefToken })
      }).catch(() => {});
    }
    clearAuth();
  };

  // 8. Permission Check Helper
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    const curRole = user.role.toLowerCase().trim();
    return allowedRoles.some(r => {
      const norm = r.toLowerCase().trim();
      if ((curRole === 'admin' || curRole === 'administrator') && (norm === 'admin' || norm === 'administrator')) return true;
      return curRole === norm;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        role: user?.role || null,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        sendOtp,
        verifyOtp,
        loginCustomerOtp,
        loginCustomerWidgetToken,
        loginStaff,
        loginAdmin,
        logout,
        refreshSession,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
