'use client';

import { useEffect } from 'react';

export default function ResizeObserverPatcher() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Suppress the exact ResizeObserver error messages in window.onerror
      const originalOnError = window.onerror;
      window.onerror = function (msg, url, line, col, error) {
        if (
          typeof msg === 'string' &&
          (msg.includes('ResizeObserver loop limit exceeded') ||
            msg.includes('ResizeObserver loop completed with undelivered notifications'))
        ) {
          return true; // Suppress
        }
        if (originalOnError) return originalOnError(msg, url, line, col, error);
        return false;
      };

      // 2. Patch the ResizeObserver API itself to delay callback execution
      if (typeof ResizeObserver !== 'undefined') {
        const _ResizeObserver = window.ResizeObserver;
        window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
          constructor(callback: ResizeObserverCallback) {
            super((entries, observer) => {
              window.requestAnimationFrame(() => {
                try {
                  callback(entries, observer);
                } catch (e) {
                  // ignore
                }
              });
            });
          }
        };
      }
    }
  }, []);

  return null;
}
