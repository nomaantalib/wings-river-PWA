'use client';

import React, { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isIOS,         setIsIOS]           = useState(false);
  const [isStandalone,  setIsStandalone]    = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Service Worker Registration ──────────────────────────
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('[PWA] SW registered:', reg.scope))
          .catch((err) => console.warn('[PWA] SW registration failed:', err));
      });
    }

    // ── Standalone / already installed check ─────────────────
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // ── iOS detection ─────────────────────────────────────────
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && !standalone);

    // ── Pick up event already stashed before React mounted ────
    const stashed = (window as any).deferredInstallPrompt as BeforeInstallPromptEvent | undefined;
    if (stashed) {
      stashed.preventDefault();
      setDeferredPrompt(stashed);
      setIsInstallable(true);
    }

    // ── Live listener for prompt events fired after mount ─────
    const handlePrompt = (e: Event) => {
      e.preventDefault();                         // Suppress native browser mini-infobar
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);

    // Allow React hook to receive events via callback bridge
    (window as any).onBeforeInstallPromptReady = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      delete (window as any).onBeforeInstallPromptReady;
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (e) {
      console.warn('[PWA] Install prompt error:', e);
    }
    return false;
  };

  return { isInstallable, isIOS, isStandalone, triggerInstall };
}
