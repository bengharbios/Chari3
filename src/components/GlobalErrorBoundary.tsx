'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#990000',
          color: 'white',
          padding: '2rem',
          zIndex: 9999999,
          overflow: 'auto',
          direction: 'ltr',
          fontFamily: 'monospace'
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
              marginTop: '2rem', 
              padding: '10px 20px', 
              fontSize: '16px', 
              cursor: 'pointer', 
              backgroundColor: 'white', 
              color: '#990000', 
              border: 'none', 
              borderRadius: '4px',
              fontWeight: 'bold'
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
