'use client';
import React from 'react';
import useBackendStatus from '../../hooks/useBackendStatus';

const BackendStatus: React.FC = () => {
  const { isOnline, checking } = useBackendStatus();

  if (checking) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#3498db',
        color: 'white',
        textAlign: 'center',
        padding: '5px',
        zIndex: 9999
      }}>
        Checking connection...
      </div>
    );
  }

  if (isOnline) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#e74c3c',
      color: 'white',
      textAlign: 'center',
      padding: '10px',
      zIndex: 9999
    }}>
      Backend server not running. Run: node app.js
    </div>
  );
};

export default BackendStatus;