'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePWAInstaller } from '@/controllers/PWAController';
import { Download, X, Smartphone, ArrowRight, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

export default function PWAInstallBanner() {
  const { isInstallable, isStandalone, isIOS, triggerInstall } = usePWAInstaller();
  const [isVisible, setIsVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user has already dismissed or app is already installed in standalone mode
    const isDismissed = localStorage.getItem('wings_install_dismissed') === 'true';
    if (!isDismissed && !isStandalone) {
      // Delay prompt slightly so user first sees hero section
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wings_install_dismissed', 'true');
    }
  };

  const handleInstall = async () => {
    if (isIOS) {
      alert('To install on iPhone/iPad: Tap the Share button in Safari, then tap "Add to Home Screen" 📲');
      handleDismiss();
      return;
    }

    const success = await triggerInstall();
    if (success) {
      setInstalled(true);
      setTimeout(() => {
        handleDismiss();
      }, 2000);
    } else {
      // Fallback redirect or close
      handleDismiss();
    }
  };

  // If already installed standalone or dismissed, render nothing
  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          onDragEnd={(_, info: PanInfo) => {
            if (info.offset.x > 120 || info.velocity.x > 500) {
              handleDismiss();
            }
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[250] bg-dark-900/95 backdrop-blur-2xl border-2 border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden text-white touch-pan-y"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
        >
          {/* Top subtle glow bar */}
          <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-green-400 animate-pulse" />

          <div className="p-4 sm:p-5 flex items-start space-x-3 relative">
            {/* App Icon */}
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="Wings River App"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-amber-400/40 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-dark-950 flex items-center justify-center text-[10px] font-black border border-dark-950">
                ✓
              </span>
            </div>

            {/* Text & Details */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                  📱 Official App
                </span>
                <span className="text-[10px] text-gray-400">· Fast & Free</span>
              </div>

              <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-tight truncate">
                Install Wings River Café App
              </h4>

              <p className="text-[11px] text-gray-300 mt-1 leading-snug line-clamp-2">
                Get instant table booking, speedboat ticket discounts & offline menu card access!
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 px-3 rounded-xl font-extrabold text-xs text-dark-950 flex items-center justify-center space-x-1.5 shadow-lg transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #16a34a)' }}
                >
                  {installed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-dark-950" />
                      <span>Installed!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{isIOS ? 'Add to Home Screen' : 'Install App'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>

              {/* Swipe to dismiss indicator hint */}
              <p className="text-[9px] text-gray-500 mt-2 font-medium flex items-center justify-between">
                <span>👉 Slide right to dismiss</span>
                <span className="text-amber-400 font-semibold">1-time notice</span>
              </p>
            </div>

            {/* Top Close X Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
