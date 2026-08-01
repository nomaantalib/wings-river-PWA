'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, CheckCircle2 } from 'lucide-react';
import { requestPushPermission, getStoredPushSubscription } from '@/lib/pushNotifications';

export default function PushNotifBanner() {
  const [state, setState] = useState<'idle' | 'subscribed' | 'denied' | 'requesting'>('idle');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already subscribed
    const existing = getStoredPushSubscription();
    if (existing) { setState('subscribed'); return; }

    // Check if dismissed before
    const wasDismissed = localStorage.getItem('wings_push_dismissed');
    if (wasDismissed) { setDismissed(true); return; }

    const perm = Notification.permission;
    if (perm === 'granted') setState('subscribed');
    else if (perm === 'denied') setState('denied');
    else setState('idle');
  }, []);

  const handleEnable = async () => {
    setState('requesting');
    const sub = await requestPushPermission();
    if (sub) {
      setState('subscribed');
    } else {
      setState('denied');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('wings_push_dismissed', '1');
  };

  if (dismissed || state === 'denied' || state === 'subscribed') return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[180] w-full max-w-sm px-3">
      <div className="bg-[#14171D] border border-[#C9B086]/40 rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3 animate-fade-in">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-[#C9B086]/20 border border-[#C9B086]/40 flex items-center justify-center text-[#C9B086]">
          <Bell className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#E8DCB8] leading-tight">Enable Notifications</p>
          <p className="text-[10px] text-[#D4C4A0]/80 leading-tight mt-0.5">
            Get instant alerts for bookings, orders &amp; table updates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {state === 'requesting' ? (
            <span className="text-[10px] text-[#C9B086] font-bold animate-pulse">Enabling…</span>
          ) : (
            <button
              onClick={handleEnable}
              className="px-3 py-1.5 bg-[#C9B086] hover:bg-[#E8DCB8] text-[#120B08] text-[11px] font-bold rounded-xl transition shadow-md"
            >
              Enable
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 text-[#D4C4A0]/60 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
