'use client';

import React, { useState, useEffect } from 'react';
import { usePWAInstaller } from '@/controllers/PWAController';
import { Download, Smartphone, X, Sparkles, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import CircularLogo from '@/components/CircularLogo';

export default function InstallPWAView() {
  const { isInstallable, isIOS, isStandalone, triggerInstall } = usePWAInstaller();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('wings_pwa_dismissed');
      if (isDismissed) {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wings_pwa_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      const installed = await triggerInstall();
      if (installed) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 5000);
      }
    }
  };

  // Don't show if already in standalone app mode or user dismissed
  if (isStandalone || (dismissed && !showIOSModal)) return null;

  return (
    <>
      {/* Floating Top PWA Install Banner */}
      {!dismissed && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[80] animate-slide-down">
          <div className="bg-dark-950/90 via-dark-900/90 to-mint-950/90 text-white rounded-3xl p-3.5 sm:p-4 border-2 border-gold-400/40 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <CircularLogo size={44} className="shadow-lg" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-serif font-extrabold text-white text-xs sm:text-sm">Wings River App</span>
                  <span className="px-2 py-0.5 rounded-full bg-gold-400 text-dark-950 text-[9px] font-extrabold uppercase">
                    Install App
                  </span>
                </div>
                <p className="text-[11px] text-cream-200 mt-0.5 line-clamp-1">
                  Fast offline menu, instant booking & ticket access!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-gradient-to-r from-mint-300 via-mint-400 to-gold-400 text-dark-950 font-extrabold text-xs rounded-xl shadow-md hover:scale-105 transition-transform"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[130] bg-dark-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gold-400/40 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-6 h-6 text-mint-400" />
                <h3 className="font-serif font-bold text-xl text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-cream-200 leading-relaxed">
              Follow these simple steps in Safari to add Wings River Café directly to your home screen:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-xl bg-gold-400 text-dark-950 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-white flex items-center space-x-1">
                    <span>Tap the Share button</span>
                    <Share className="w-3.5 h-3.5 text-mint-400 inline" />
                  </p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Located at the bottom of your Safari browser bar.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-xl bg-gold-400 text-dark-950 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-white flex items-center space-x-1">
                    <span>Select &apos;Add to Home Screen&apos;</span>
                    <PlusSquare className="w-3.5 h-3.5 text-mint-400 inline" />
                  </p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Scroll down the share menu options to find it.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-xl bg-gold-400 text-dark-950 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-white">Tap &apos;Add&apos; in top right</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Wings River icon will instantly appear on your mobile home screen!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-mint-400 text-dark-950 font-bold text-xs rounded-xl shadow-lg"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {installedSuccess && (
        <div className="fixed top-20 right-6 z-[130] bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-xs">Wings River App installed successfully!</span>
        </div>
      )}
    </>
  );
}
