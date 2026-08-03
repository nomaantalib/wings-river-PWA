'use client';

import React from 'react';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import GlobalNotificationSystem from './GlobalNotificationSystem';

interface CustomerLayoutProps {
  children: React.ReactNode;
  /** Breadcrumb items (excluding Home which is always prepended). */
  breadcrumbs?: BreadcrumbItem[];
  /** Number of cart items to show on mobile nav badge. */
  cartCount?: number;
  /** Set false to suppress the footer on pages that scroll a lot. */
  showFooter?: boolean;
  /** Extra className for the main content wrapper. */
  contentClassName?: string;
}

export default function CustomerLayout({
  children,
  breadcrumbs,
  cartCount = 0,
  showFooter = true,
  contentClassName = '',
}: CustomerLayoutProps) {
  // Navbar handlers are no-ops here for subpages
  const noop = () => {};

  return (
    <GlobalNotificationSystem>
      <div className="min-h-screen flex flex-col bg-dark-950 text-white">
        {/* Fixed top navbar */}
        <Navbar onOpenBooking={noop} onOpenAuth={noop} />

        {/* Page Content */}
        <main
          id="main-content"
          className={`flex-1 pt-[68px] pb-24 lg:pb-8 ${contentClassName}`}
          tabIndex={-1}
        >
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="px-4 py-3 max-w-7xl mx-auto">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          {children}
        </main>

        {/* Footer (desktop) */}
        {showFooter && (
          <div className="hidden lg:block">
            <Footer />
          </div>
        )}

        {/* Mobile bottom nav */}
        <MobileBottomNav cartCount={cartCount} />
      </div>
    </GlobalNotificationSystem>
  );
}
