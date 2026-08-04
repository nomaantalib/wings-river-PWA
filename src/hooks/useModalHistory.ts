'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to bind any modal, drawer, or full-screen overlay state
 * to the browser & mobile device hardware back button (Android Back / iOS Swipe Back).
 * 
 * - When `isOpen` becomes true, it pushes a history state `{ modal: modalId }`.
 * - When user presses the device back button (popstate), it invokes `onClose()`.
 * - When closed via UI (X button / backdrop), it cleanly pops the history state.
 */
export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string = 'modal') {
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // Keep latest onClose callback reference
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (e: PopStateEvent) => {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        onCloseRef.current();
      }
    };

    if (isOpen) {
      if (!isPushedRef.current) {
        const stateId = `${modalId}_${Date.now()}`;
        window.history.pushState({ modal: modalId, stateId }, '');
        isPushedRef.current = true;
      }
      window.addEventListener('popstate', handlePopState);
    } else {
      if (isPushedRef.current) {
        isPushedRef.current = false;
        // If closed programmatically (e.g. user clicked close button or backdrop)
        // pop the pushed state to keep browser history synchronized
        if (window.history.state && window.history.state.modal === modalId) {
          window.history.back();
        }
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, modalId]);
}
