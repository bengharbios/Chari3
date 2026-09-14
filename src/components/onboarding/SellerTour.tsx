'use client';
import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuthStore, useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n/useTranslation';

// The current version of the tour. Increase this to show the tour again to old users.
export const CURRENT_TOUR_VERSION = 1;

interface TourContextType {
  startTour: () => void;
}

const TourContext = createContext<TourContextType>({ startTour: () => {} });

export const useTour = () => useContext(TourContext);

export default function SellerTourProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated, setSellerTourVersion } = useAuthStore();
  const { isSidebarOpen } = useAppStore();
  const { t, isAr } = useTranslation();
  const tourStarted = useRef(false);

  const startTour = useCallback(() => {
    // Determine if mobile
    const isMobile = window.innerWidth < 768;

    const steps: DriveStep[] = [
      {
        popover: {
          title: t('tour.welcome_title'),
          description: t('tour.welcome_desc'),
          popoverClass: isAr ? 'driver-rtl-fix' : '',
        },
      },
      {
        element: '#tour-verification-widget',
        popover: {
          title: t('tour.verify_title'),
          description: t('tour.verify_desc'),
          side: 'bottom',
          align: 'center',
          popoverClass: isAr ? 'driver-rtl-fix' : '',
        },
      },
    ];

    if (!isMobile) {
      steps.push(
        {
          element: '#tour-products-menu',
          popover: {
            title: t('tour.products_title'),
            description: t('tour.products_desc'),
            side: isAr ? 'left' : 'right',
            align: 'center',
            popoverClass: isAr ? 'driver-rtl-fix' : '',
          },
        },
        {
          element: '#tour-settings-menu',
          popover: {
            title: t('tour.settings_title'),
            description: t('tour.settings_desc'),
            side: isAr ? 'left' : 'right',
            align: 'center',
            popoverClass: isAr ? 'driver-rtl-fix' : '',
          },
        }
      );
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: t('tour.next'),
      prevBtnText: t('tour.previous'),
      doneBtnText: t('tour.done'),
      progressText: '{{current}} / {{total}}',
      allowClose: false, // Prevents closing by clicking outside, must use buttons
      overlayOpacity: 0.75,
      steps: steps,
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep() || confirm(t('tour.skip', 'Skip tour?'))) {
          driverObj.destroy();
          // Mark as complete in backend
          if (user && (user.sellerTourVersion || 0) < CURRENT_TOUR_VERSION) {
            setSellerTourVersion(CURRENT_TOUR_VERSION);
            fetch('/api/seller/tour/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ version: CURRENT_TOUR_VERSION }),
            }).catch(console.error);
          }
        }
      },
      onHighlightStarted: (el) => {
        // Prevent clicking the highlighted element itself to avoid breaking the tour
        if (el) {
          el.style.pointerEvents = 'none';
        }
      },
      onDeselected: (el) => {
        // Restore pointer events
        if (el) {
          el.style.pointerEvents = '';
        }
      }
    });

    driverObj.drive();
  }, [t, isAr, user, setSellerTourVersion]);

  // Auto-start logic
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated || !user || user.role === 'admin' || user.role === 'buyer') return;
    
    // Check version
    const userVersion = user.sellerTourVersion || 0;
    if (userVersion >= CURRENT_TOUR_VERSION) return;
    
    if (tourStarted.current) return;

    // Use MutationObserver to wait for the DOM elements (specifically sidebar)
    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver((mutations, obs) => {
      const isMobile = window.innerWidth < 768;
      // On desktop, wait for sidebar. On mobile, we skip it, so we can start immediately
      const requiredElement = isMobile ? document.body : document.getElementById('tour-products-menu');
      
      if (requiredElement) {
        obs.disconnect();
        clearTimeout(timeoutId);
        tourStarted.current = true;
        // Small delay to allow CSS transitions (like sidebar open) to finish
        setTimeout(startTour, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout fallback (5 seconds)
    timeoutId = setTimeout(() => {
      observer.disconnect();
      // If we timed out but still want to show something, we can start with whatever is available
      if (!tourStarted.current) {
        tourStarted.current = true;
        startTour();
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [_hasHydrated, isAuthenticated, user, startTour]);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      <style dangerouslySetInnerHTML={{__html: `
        [dir="rtl"] .driver-rtl-fix {
          text-align: right;
          direction: rtl;
        }
        [dir="rtl"] .driver-popover-footer {
          flex-direction: row-reverse;
        }
      `}} />
    </TourContext.Provider>
  );
}
