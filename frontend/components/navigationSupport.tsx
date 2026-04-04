// Created by Marisol Morales for Work Review 3
"use client"

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function NavigationSupport() {
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('focusMode') === 'true';
    setFocusMode(saved);
    document.documentElement.setAttribute('data-focus-mode', String(saved));
  }, []);

  const toggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    localStorage.setItem('focusMode', String(next));
    document.documentElement.setAttribute('data-focus-mode', String(next));
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--background)',
        boxShadow: 'var(--shadow-md)',
        border: '2px solid var(--color-cyan)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-cyan-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
            Navigation Support
          </h3>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
            Makes buttons, links, and inputs easier to follow when navigating with a keyboard.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleFocusMode}
              aria-label="Toggle navigation support"
              aria-pressed={focusMode}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '2rem',
                width: '3.5rem',
                alignItems: 'center',
                borderRadius: 'var(--radius-full)',
                backgroundColor: focusMode ? 'var(--color-cyan)' : 'var(--color-gray-light)',
                transition: 'var(--transition-base)',
                border: '2px solid var(--color-gray-light)',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '1.5rem',
                  width: '1.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: focusMode ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                  transition: 'var(--transition-base)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />
            </button>

            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' }}>
              {focusMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}