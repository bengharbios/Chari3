'use client';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useAdminAuthStore } from '@/lib/store/admin-auth';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugState() {
  const appState = useAppStore();
  const authState = useAuthStore();
  const adminAuthState = useAdminAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  if (!mounted || process.env.NODE_ENV !== 'development') return null;

  const isAdmin = pathname?.startsWith('/admin-secure-internal');
  const isAuthenticated = isAdmin ? adminAuthState.isAdminAuthenticated : authState.isAuthenticated;
  const user = isAdmin ? adminAuthState.adminUser : authState.user;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'rgba(255,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', maxWidth: '300px', wordWrap: 'break-word', pointerEvents: 'none' }}>
      <b>Debug State</b><br/>
      currentPage: {appState.currentPage}<br/>
      isAuthenticated: {String(isAuthenticated)}<br/>
      user: {user ? user.email : 'null'}<br/>
      role: {user ? (user as any).role : 'none'}
    </div>
  );
}
