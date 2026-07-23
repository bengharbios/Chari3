'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthSync() {
  const { data, isPending, error } = useSession();
  const { isAuthenticated, loginWithUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isPending) return;

    if (data?.user && !isAuthenticated) {
      // User is authenticated on the server but not in Zustand
      loginWithUser(data.user as any); // Cast to any to map BetterAuth User to Zustand User
    } else if (!data?.user && isAuthenticated) {
      // Background session polling (useSession) returned null.
      // We DO NOT force logout here because of Cloudflare Bot Fight Mode 
      // intercepting background requests. Instead, we rely on the global 
      // fetch interceptor below to catch definitive 401 Unauthorized errors.
    }
  }, [mounted, isPending, data, isAuthenticated, loginWithUser]);

  // Global standard: Intercept fetch requests to catch 401 Unauthorized responses
  // This definitively proves the session is dead without relying on flaky background polling.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent attaching multiple times in strict mode
    if ((window as any).__fetchIntercepted) return;
    (window as any).__fetchIntercepted = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        let url = '';
        if (typeof args[0] === 'string') {
          url = args[0];
        } else if (args[0] instanceof Request) {
          url = args[0].url;
        } else if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
          url = (args[0] as any).url;
        }

        // Only intercept if it is a local API request on our domain
        const isSelfOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
        const isApiRoute = url.includes('/api/');

        if (isSelfOrigin && isApiRoute && !url.includes('/api/auth/') && !url.includes('/login') && !url.includes('/api/user/profile') && !url.includes('/api/notifications')) {
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated) {
            // Grace period: ignore 401s for 60 seconds after a fresh login.
            // Cookie propagation and Cloudflare challenges can take longer than expected.
            try {
              const loginTs = sessionStorage.getItem('__login_ts');
              if (loginTs && Date.now() - parseInt(loginTs, 10) < 60000) {
                console.warn(`[GlobalFetch] 401 on ${url} within 60s of login — ignoring.`);
                return response;
              }
            } catch {}

            console.warn(`[GlobalFetch] 401 Unauthorized on ${url} — verifying session before logout...`);

            // Save diagnostic details
            try {
              localStorage.setItem('__last_logout_reason', JSON.stringify({
                url,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
              }));
            } catch {}

            // IMPORTANT: Do NOT logout immediately on the first 401.
            // Wait 3 seconds and verify the session is truly dead.
            // This prevents false logouts from Cloudflare transient errors or slow cookie propagation.
            setTimeout(async () => {
              try {
                const { authClient } = await import('@/lib/auth-client');
                const session = await authClient.getSession();
                if (session?.data?.user) {
                  // Session is still valid — the 401 was a transient error, ignore it
                  console.warn(`[GlobalFetch] Session still valid after 401 on ${url} — NOT logging out.`);
                  return;
                }
              } catch {
                // If we can't verify, err on the side of caution and don't logout
                console.warn(`[GlobalFetch] Could not verify session after 401 on ${url} — NOT logging out (network error).`);
                return;
              }

              // Session is truly dead — logout
              const currentAuthStore = useAuthStore.getState();
              if (currentAuthStore.isAuthenticated) {
                console.warn(`[GlobalFetch] Session confirmed dead after 401 on ${url} — logging out.`);
                currentAuthStore.logout();
              }
            }, 3000);
          }
        }
      }
      return response;
    };
  }, []);

  // Force password change redirect: if user has the flag set, redirect them immediately
  useEffect(() => {
    if (!mounted) return;
    const currentUser = useAuthStore.getState().user;
    if (
      currentUser &&
      (currentUser as any).forcePasswordChange === true &&
      pathname !== '/force-password-change'
    ) {
      router.replace('/force-password-change');
    }
  }, [mounted, pathname, router]);

  return null;
}
