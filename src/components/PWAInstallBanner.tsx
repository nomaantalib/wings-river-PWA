'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstaller } from '@/controllers/PWAController';

export default function PWAInstallBanner() {
  const { isInstallable, isIOS, isStandalone, triggerInstall } = usePWAInstaller();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionDismissed = sessionStorage.getItem('wings_pwa_dismissed');
      if (sessionDismissed === 'true') {
        setDismissed(true);
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await triggerInstall();
      if (installed) {
        setDismissed(true);
      }
    } else if (isIOS) {
      alert('To install Wings River App on iOS:\n1. Tap the Share button (⎋) at the bottom of Safari.\n2. Select "Add to Home Screen" (+).');
    } else {
      alert('To install Wings River App:\nTap your browser menu (⋮ or ⚙️) and select "Install App" or "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('wings_pwa_dismissed', 'true');
  };

  // Only show if it's installable or iOS AND not in standalone mode and not dismissed
  if (isStandalone || dismissed || (!isInstallable && !isIOS)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[150] animate-bounce-in">
      <div className="p-4 sm:p-5 rounded-3xl bg-dark-950/95 border border-amber-400/40 shadow-2xl backdrop-blur-2xl text-white relative flex items-center space-x-4 group">
        
        {/* Glow backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-emerald-500/30 rounded-3xl blur-md -z-10 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Logo Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shrink-0 shadow-lg flex items-center justify-center">
          <img src="/logo.png" alt="Wings Logo" className="w-full h-full object-cover rounded-xl" />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-serif font-extrabold text-sm text-white truncate">Wings River Café App</h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </div>
          <p className="text-[11px] text-gray-300 leading-tight mt-0.5">
            Install app on your device for instant offline access & table booking!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-black text-xs shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
            title="Dismiss banner for this visit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
