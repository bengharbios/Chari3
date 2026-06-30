'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorStr, setErrorStr] = useState('');

  useEffect(() => {
    console.error('[ErrorBoundary RAW]', error);
    try {
      setErrorStr(error.message + '\n\n' + error.stack);
    } catch (e) {
      setErrorStr(String(error));
    }
  }, [error]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', direction: 'ltr', background: '#fff', color: '#000', minHeight: '100vh', width: '100vw', overflow: 'auto', textAlign: 'left' }}>
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        CRITICAL ERROR INTERCEPTED
      </h1>
      <p style={{ marginBottom: '10px' }}>Please take a screenshot of this page or copy the text and send it back to the AI assistant.</p>
      
      <div style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5' }}>
        <strong>Message:</strong> {error.message || 'Unknown message'}
        <br/><br/>
        <strong>Digest:</strong> {error.digest || 'No digest'}
        <br/><br/>
        <strong>Stack Trace:</strong>
        <br/>
        {errorStr || error.stack || 'No stack trace available'}
      </div>

      <button 
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Try Again (Reset)
      </button>
    </div>
  );
}
