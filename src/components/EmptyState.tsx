'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
      {/* Icon Glow Orb */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gold-500/15 blur-2xl scale-150" aria-hidden />
        <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon className="w-9 h-9 text-gold-400/80" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 font-serif">{title}</h3>
      {description && (
        <p className="text-sm text-white/50 max-w-xs leading-relaxed mb-6">{description}</p>
      )}

      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </Link>
      )}

      {(actionLabel && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-full shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
