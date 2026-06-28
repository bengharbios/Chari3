'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/lib/store';

export default function AuthSync() {
  const { data, isPending, error } = useSession();
  const { isAuthenticated, loginWithUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isPending) return;

    if (data?.user && !isAuthenticated) {
      // User is authenticated on the server but not in Zustand
      loginWithUser(data.user as any); // Cast to any to map BetterAuth User to Zustand User
    } else if (!data?.user && isAuthenticated) {
      // User is logged out on the server but still authenticated in Zustand
      
      // If there's a network or server error (like a DB connection panic), don't falsely log out the user
      if (error) {
        console.warn('[AuthSync] Session fetch failed with error, preserving local session state.', error);
        return;
      }
      // Check if they just logged in within the last 10 seconds to prevent race conditions with cached useSession()
      if (typeof window !== 'undefined') {
        try {
          const justLoggedInStr = sessionStorage.getItem('just_logged_in');
          if (justLoggedInStr) {
            const diff = Date.now() - parseInt(justLoggedInStr, 10);
            if (diff < 10000) { // 10 seconds guard
              return;
            }
          }
          
          const justLoggedOutStr = sessionStorage.getItem('just_logged_out');
          if (justLoggedOutStr) {
            const diff = Date.now() - parseInt(justLoggedOutStr, 10);
            if (diff < 5000) { // 5 seconds guard
              console.log('[AuthSync] Ignoring session because user just logged out');
              return;
            }
          }
        } catch (e) {
          console.error('[AuthSync] failed to read sessionStorage:', e);
        }
      }

      const currentUser = useAuthStore.getState().user;
      // Preserve demo users (whose IDs typically contain '-001')
      if (currentUser?.id?.includes('-001')) {
        return;
      }
      
      // DISABLED: Cloudflare Bot Fight Mode intercepts the background session check
      // and returns HTML (data: null, error: null), falsely logging out legitimate users.
      // logout();
    }
  }, [mounted, isPending, data, error, isAuthenticated, loginWithUser, logout]);

  return null;
}
