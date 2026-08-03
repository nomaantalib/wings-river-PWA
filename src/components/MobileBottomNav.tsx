'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, UtensilsCrossed, CalendarCheck, ShoppingCart, User,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  exactMatch?: boolean;
}

interface MobileBottomNavProps {
  cartCount?: number;
}

export default function MobileBottomNav({ cartCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      exactMatch: true,
    },
    {
      href: '/menu',
      label: 'Menu',
      icon: <UtensilsCrossed className="w-[22px] h-[22px]" strokeWidth={1.8} />,
    },
    {
      href: '/reserve',
      label: 'Reserve',
      icon: <CalendarCheck className="w-[22px] h-[22px]" strokeWidth={1.8} />,
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: <ShoppingCart className="w-[22px] h-[22px]" strokeWidth={1.8} />,
      badge: cartCount,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className="w-[22px] h-[22px]" strokeWidth={1.8} />,
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.exactMatch) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      aria-label="Mobile navigation"
      role="navigation"
    >
      {/* Backdrop glassmorphism */}
      <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-[3px] px-3 py-1.5 rounded-xl transition-all duration-200
                ${active ? 'text-gold-400' : 'text-white/45 hover:text-white/75'}`}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold-400" aria-hidden />
              )}
              {/* Icon with active scale */}
              <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none tracking-wide">{item.label}</span>

              {/* Badge */}
              {!!item.badge && item.badge > 0 && (
                <span
                  className="absolute -top-0.5 right-1.5 min-w-[18px] h-[18px] text-[10px] font-bold bg-gold-500 text-slate-950 rounded-full flex items-center justify-center px-1 leading-none"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
