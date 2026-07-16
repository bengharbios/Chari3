'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const CHUNK_RELOAD_KEY = '__chunk_reload_ts';

function isChunkLoadError(error: Error): boolean {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.message?.includes('Failed to load chunk') ||
    error?.message?.includes('Loading chunk') ||
    error?.message?.includes('ChunkLoadError')
  );
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isChunkError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, isChunkError: isChunkLoadError(error), error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // ChunkLoadError = stale JS bundle from a new deployment.
    // Auto-reload ONCE to fetch the fresh bundle. If it fails again,
    // show the error screen to prevent infinite reload loops.
    if (isChunkLoadError(error)) {
      try {
        const lastReload = sessionStorage.getItem(CHUNK_RELOAD_KEY);
        const now = Date.now();
        // Only auto-reload if we haven't reloaded in the last 10 seconds
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, now.toString());
          console.warn('[GlobalErrorBoundary] ChunkLoadError — auto-reloading to fetch fresh bundle.');
          window.location.reload();
        } else {
          console.error('[GlobalErrorBoundary] ChunkLoadError reload already attempted. Showing error screen.');
        }
      } catch {
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      // If it's a chunk error and we triggered a reload, show a minimal loading screen
      if (this.state.isChunkError) {
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#0f172a', color: 'white',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 9999999, fontFamily: 'sans-serif', gap: '1rem',
          }}>
            <div style={{ fontSize: '48px' }}>🔄</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>جاري تحديث الصفحة...</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Refreshing app to load the latest version</p>
          </div>
        );
      }

      // Other errors — show full error screen
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#990000', color: 'white',
          padding: '2rem', zIndex: 9999999, overflow: 'auto',
          direction: 'ltr', fontFamily: 'monospace'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '1rem', borderBottom: '2px solid white', paddingBottom: '0.5rem' }}>CRITICAL ERROR INTERCEPTED</h1>
          <p style={{ marginBottom: '1rem', fontSize: '16px' }}>
            An unexpected error occurred in the React component tree.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '18px', color: '#ffaaaa', marginBottom: '0.5rem' }}>Error Message:</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{this.state.error?.toString()}</pre>
          </div>
          
          {this.state.errorInfo && (
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
              <h2 style={{ fontSize: '18px', color: '#ffaaaa', marginBottom: '0.5rem' }}>Component Stack (Where it happened):</h2>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '2rem', padding: '10px 20px', fontSize: '16px', 
              cursor: 'pointer', backgroundColor: 'white', color: '#990000', 
              border: 'none', borderRadius: '4px', fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}


