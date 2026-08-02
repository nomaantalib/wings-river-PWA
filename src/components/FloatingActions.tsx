'use client';

import React, { useState, useEffect } from 'react';
import { ScanLine } from 'lucide-react';

export default function FloatingActions() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 right-4 z-[90] pointer-events-auto">
      <button
        onClick={() => window.dispatchEvent(new Event('wings_open_qr_order'))}
        aria-label="Scan Table QR to Order Food"
        className={[
          'group relative flex items-center gap-2.5 pl-4 pr-5 py-3.5',
          'rounded-2xl bg-[#F5D061] text-[#120B08]',
          'shadow-[0_8px_32px_rgba(245,208,97,0.45)]',
          'font-extrabold text-sm leading-none',
          'hover:bg-[#E5B82C] hover:shadow-[0_8px_40px_rgba(245,208,97,0.6)]',
          'active:scale-95 transition-all duration-200',
          pulse ? 'animate-bounce' : '',
        ].join(' ')}
        style={pulse ? { animationDuration: '2.2s' } : undefined}
      >
        {/* Glow ring on pulse */}
        {pulse && (
          <span className="absolute inset-0 rounded-2xl bg-[#F5D061]/40 animate-ping" />
        )}

        <ScanLine className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-6" />
        <span className="whitespace-nowrap tracking-tight">Scan &amp; Order</span>
      </button>
    </div>
  );
}
