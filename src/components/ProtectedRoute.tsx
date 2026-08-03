'use client';

import React from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { ShieldAlert, Lock, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-[#F5D061] mb-3" />
        <p className="text-xs font-mono tracking-widest text-[#D4C4A0] uppercase">Verifying Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#14171D] border border-[#F5D061]/30 rounded-3xl p-8 text-center text-white shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F5D061]/15 border border-[#F5D061]/30 flex items-center justify-center mx-auto text-[#F5D061]">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#F8E7A1]">Authentication Required</h3>
          <p className="text-xs text-[#D4C4A0] leading-relaxed">
            You must be logged in to access this page. Please sign in with your credentials or OTP code.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#14171D] border border-red-500/30 rounded-3xl p-8 text-center text-white shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-red-300">Access Restricted</h3>
          <p className="text-xs text-[#D4C4A0] leading-relaxed">
            Your account role (<span className="font-bold text-white uppercase">{user?.role}</span>) does not have authorization to view this area.
          </p>
          <div className="pt-2 text-[11px] text-[#98A886] font-mono">
            Required Roles: {allowedRoles.join(', ')}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
