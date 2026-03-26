// Added by Reymes 3/24/2026 - Simple UI toggle for users who may get overstimulated or overwhelmed
// This component is self-contained and manages its own UI card display.
// State is managed in ThemeProvider and applied as the .simple-ui CSS class on <html>.

"use client"

import { useTheme } from '@/components/ThemeProvider';
import { Wind } from 'lucide-react';

export default function SimpleUIToggle() {
  const { simpleUI, toggleSimpleUI } = useTheme();

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--background)',
        boxShadow: 'var(--shadow-md)',
        border: '2px solid var(--color-cyan)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Icon */}
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-cyan-yellow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Wind className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
            Simple UI
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '0.75rem' }}>
            Reduces animations, gradients, bright colors, and decorative shadows across the entire
            site — creating a calmer, less visually overwhelming experience.
          </p>

          {/* What it does list */}
          <ul
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-gray)',
              marginBottom: '1rem',
              paddingLeft: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem'
            }}
          >
            <li>Disables all animations and page transitions</li>
            <li>Replaces gradients with flat, solid colors</li>
            <li>Removes decorative shadows</li>
            <li>Softens the color palette site-wide</li>
          </ul>

          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleSimpleUI}
              aria-label="Toggle simple UI mode"
              aria-pressed={simpleUI}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '2rem',
                width: '3.5rem',
                alignItems: 'center',
                borderRadius: 'var(--radius-full)',
                backgroundColor: simpleUI ? 'var(--color-cyan)' : 'var(--color-gray-light)',
                transition: 'var(--transition-base)',
                border: '2px solid var(--color-gray-light)',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '1.5rem',
                  width: '1.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  transform: simpleUI ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                  transition: 'var(--transition-base)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' }}>
              {simpleUI ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
