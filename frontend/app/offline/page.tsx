// daniel q. 2/28/26 start
'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          📡
        </div>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '20px',
          fontSize: '32px'
        }}>
          Currently Offline
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          The backend server is not running. Please start the backend server to continue.
        </p>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '30px',
          fontFamily: 'monospace'
        }}>
          <code style={{ color: '#333' }}>
            cd backend && node app.js
          </code>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link href="/" style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Return Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'white',
              color: '#667eea',
              padding: '12px 24px',
              borderRadius: '5px',
              border: '2px solid #667eea',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}