'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-xs font-medium overflow-x-auto scrollbar-none ${className}`}
    >
      <ol className="flex items-center gap-1 whitespace-nowrap">
        {allItems.map((item, idx) => {
          const isLast = idx === allItems.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx === 0 && (
                <Home className="w-3.5 h-3.5 text-white/40 shrink-0" aria-hidden />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-white/50 hover:text-gold-400 transition-colors duration-200"
                >
                  {idx > 0 && item.label}
                  {idx === 0 && <span className="sr-only">Home</span>}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-gold-400 font-semibold' : 'text-white/50'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {idx > 0 ? item.label : <span className="sr-only">Home</span>}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="w-3 h-3 text-white/25 shrink-0" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
