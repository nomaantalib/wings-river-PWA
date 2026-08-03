'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent default browser jump to top on reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const storageKey = `wings_scroll_pos_${pathname}`;
    const sectionKey = `wings_section_${pathname}`;

    // Helper to restore position or section
    const restorePosition = () => {
      const currentHash = window.location.hash;
      const savedSection = sessionStorage.getItem(sectionKey);
      const targetHash = currentHash || savedSection;

      if (targetHash && targetHash.length > 1) {
        const targetId = targetHash.replace('#', '');
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'instant', block: 'start' });
          return;
        }
      }

      const savedPos = sessionStorage.getItem(storageKey);
      if (savedPos !== null) {
        const topPos = parseInt(savedPos, 10);
        if (!isNaN(topPos) && topPos > 0) {
          window.scrollTo({ top: topPos, behavior: 'instant' });
        }
      }
    };

    // Immediate & Multi-stage restoration for Layout/Asset loading
    restorePosition();
    const t1 = setTimeout(restorePosition, 100);
    const t2 = setTimeout(restorePosition, 400);
    const t3 = setTimeout(restorePosition, 1000);

    // Save scroll position & visible section on user scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(storageKey, window.scrollY.toString());

        // Check if hash matches active element in view
        if (window.location.hash) {
          sessionStorage.setItem(sectionKey, window.location.hash);
        }
      }, 100);
    };

    const handleHashChange = () => {
      if (window.location.hash) {
        sessionStorage.setItem(sectionKey, window.location.hash);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname]);

  return null;
}
