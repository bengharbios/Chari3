'use client';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function DebugState() {
  const appState = useAppStore();
  const authState = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'rgba(255,0,0,0.8)', color: 'white', padding: '10px', fontSize: '12px', maxWidth: '300px', wordWrap: 'break-word', pointerEvents: 'none' }}>
      <b>Debug State</b><br/>
      currentPage: {appState.currentPage}<br/>
      isAuthenticated: {String(authState.isAuthenticated)}<br/>
      user: {authState.user ? authState.user.email : 'null'}<br/>
      role: {authState.user ? authState.user.role : 'none'}
    </div>
  );
}
