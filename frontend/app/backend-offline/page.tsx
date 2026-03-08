// frontend/app/backend-offline/page.tsx
'use client';

import React from 'react';

const BackendOfflinePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#e74c3c' }}>Backend Offline</h1>
        <p style={{ margin: '20px 0', color: '#666' }}>
          Cannot connect to the backend server.
        </p>
        <p style={{
          background: '#f8f9fa',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          node app.js
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default BackendOfflinePage;