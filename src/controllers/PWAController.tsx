'use client';

import React, { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
          .catch((err) => console.log('Service Worker registration failed:', err));
      });
    }

    // Check Standalone Mode (Already installed)
    const isStandaloneMode =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as any).standalone === true);
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice && !isStandaloneMode);

    // Load globally captured deferred prompt if it fired early
    if (typeof window !== 'undefined') {
      const globalPrompt = (window as any).deferredInstallPrompt;
      if (globalPrompt) {
        setDeferredPrompt(globalPrompt);
        setIsInstallable(true);
      }

      // Listen for prompt ready callback if fired mid-load
      (window as any).onBeforeInstallPromptReady = (e: BeforeInstallPromptEvent) => {
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
    }

    // Catch Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (typeof window !== 'undefined') {
        delete (window as any).onBeforeInstallPromptReady;
      }
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }

    return false;
  };

  return {
    isInstallable,
    isIOS,
    isStandalone,
    triggerInstall
  };
}
