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
        const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
        // Do not intercept auth endpoints to prevent infinite logout loops
        if (url && !url.includes('/api/auth/') && !url.includes('/login')) {
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated) {
            // Grace period: ignore 401s for 5 seconds after a fresh login
            // This handles race conditions where the session cookie is still
            // propagating through Cloudflare or the browser cookie jar.
            try {
              const loginTs = sessionStorage.getItem('__login_ts');
              if (loginTs && Date.now() - parseInt(loginTs, 10) < 5000) {
                console.warn(`[GlobalFetch] 401 on ${url} within 5s of login — ignoring (cookie propagation race).`);
                return response;
              }
            } catch {}

            console.warn(`[GlobalFetch] 401 Unauthorized detected on ${url} - Logging out user.`);
            authStore.logout();
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

