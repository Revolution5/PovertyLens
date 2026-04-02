// Created by Marisol Morales 3/4/2026 for accessibility page via Account Settings 

"use client"

import { useTheme } from '@/components/ThemeProvider';
import { useColorblind } from '@/components/ColorblindProvider'; // Added by Reymes 3/24/2026
import { COLORBLIND_MODES, type ColorblindMode } from '@/components/colorblindPalette'; // Added by Reymes 3/24/2026
import SimpleUIToggle from '@/components/SimpleUIToggle'; // Added by Reymes 3/24/2026 - Simple UI mode
import Link from 'next/link';
import { ArrowLeft, Moon, Sun, Contrast, Sparkles, Eye, Type } from 'lucide-react';

const TEXT_SCALE_OPTIONS = [
  { value: 1, label: '100% (Default)' },
  { value: 1.15, label: '115% (Comfort)' },
  { value: 1.3, label: '130% (Large)' },
  { value: 1.4, label: '140% (Extra Large)' },
];

export default function AccessibilityPage() {
  const { 
    theme, 
    contrast, 
    textScale,
    toggleTheme, 
    toggleContrast,
    setTextScale,
  } = useTheme();
  // Added by Reymes 3/24/2026
  const { colorblindMode, setColorblindMode } = useColorblind();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-gray)',
              transition: 'var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-gray)';
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Settings
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-3xl mb-1 font-bold" style={{ color: 'var(--foreground)' }}>
            Accessibility Settings
          </h1>
          <p style={{ color: 'var(--color-gray)', fontSize: '1.125rem' }}>
            Customize your experience to meet your accessibility needs
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Theme Toggle */}
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
                {theme === "dark" ? (
                  <Moon className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                ) : (
                  <Sun className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Theme
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
                  Switch between light and dark mode to reduce eye strain and improve readability
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={toggleTheme}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      height: '2rem',
                      width: '3.5rem',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: theme === "dark" ? "var(--color-cyan)" : "var(--color-gray-light)",
                      transition: 'var(--transition-base)',
                      border: '2px solid var(--color-gray-light)',
                      cursor: 'pointer'
                    }}
                    aria-label="Toggle theme"
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        height: '1.5rem',
                        width: '1.5rem',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        transform: theme === "dark" ? "translateX(1.5rem)" : "translateX(0.25rem)",
                        transition: 'var(--transition-base)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' }}>
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* High Contrast */}
          <div 
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--background)',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--color-orange)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div 
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-orange-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Contrast className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  High Contrast
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
                  Increase contrast between text and background for better visibility
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={toggleContrast}
                    aria-label="Toggle high contrast mode"
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      height: '2rem',
                      width: '3.5rem',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: contrast === 'high' ? "var(--color-orange)" : "var(--color-gray-light)",
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
                        transform: contrast === 'high' ? "translateX(1.5rem)" : "translateX(0.25rem)",
                        transition: 'var(--transition-base)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' }}>
                    {contrast === 'high' ? "Enabled" : "Disabled"}
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* ===== Colorblind Mode - Added by Reymes 3/24/2026 ===== */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--background)',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--color-orange)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-orange-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Eye className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Colorblind Mode
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
                  Adjusts map colors and UI accents so every poverty level is clearly distinguishable
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(Object.keys(COLORBLIND_MODES) as ColorblindMode[]).map((mode) => {
                    const info = COLORBLIND_MODES[mode];
                    return (
                      <label
                        key={mode}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.625rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: colorblindMode === mode
                            ? '2px solid var(--color-orange)'
                            : '2px solid var(--color-gray-light)',
                          cursor: 'pointer',
                          transition: 'var(--transition-base)',
                        }}
                      >
                        <input
                          type="radio"
                          name="colorblindMode"
                          value={mode}
                          checked={colorblindMode === mode}
                          onChange={() => setColorblindMode(mode)}
                          style={{ marginTop: '0.25rem', accentColor: 'var(--color-orange)', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '500', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                              {info.label}
                            </span>
                            {/* Color preview swatches */}
                            <span style={{ display: 'flex', gap: '3px' }}>
                              {info.preview.map((color, i) => (
                                <span
                                  key={i}
                                  style={{
                                    display: 'inline-block',
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '3px',
                                    backgroundColor: color,
                                    border: '1px solid rgba(0,0,0,0.18)',
                                  }}
                                />
                              ))}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--color-gray)', marginTop: '0.15rem' }}>
                            {info.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* ===== End Colorblind Mode ===== */}

          {/* Simple UI - Added by Reymes 3/24/2026 */}
          <SimpleUIToggle />

          {/* Text Scaling - Added by Damon 4/1/2026 */}
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
                <Type className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--foreground)' }}>
                  Text Size
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginBottom: '1rem' }}>
                  Increase text size across the site for easier reading. This works alongside browser zoom.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {TEXT_SCALE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: textScale === option.value
                          ? '2px solid var(--color-cyan)'
                          : '2px solid var(--color-gray-light)',
                        cursor: 'pointer',
                        transition: 'var(--transition-base)',
                      }}
                    >
                      <input
                        type="radio"
                        name="textScale"
                        value={option.value}
                        checked={textScale === option.value}
                        onChange={() => setTextScale(option.value)}
                        style={{ accentColor: 'var(--color-cyan)', flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: '500', color: 'var(--foreground)', fontSize: '0.9rem' }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div 
            style={{
              marginTop: '2rem',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-light)',
              border: '2px dashed var(--color-yellow)',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-cyan-yellow)',
                marginBottom: '1rem'
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
            </div>
            <h3 style={{ fontWeight: '700', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
              More Features Coming Soon
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)', maxWidth: '32rem', margin: '0 auto' }}>
              We're working on adding more accessibility features including 
              reduced motion options and keyboard navigation enhancements. Stay tuned!
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div 
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-light)',
            border: '2px solid var(--color-cyan)'
          }}
        >
          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
            Need More Help?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
            If you're experiencing any accessibility issues or need additional accommodations, 
            please contact our support team. We're committed to making our application accessible 
            to everyone.
          </p>
        </div>
      </main>
    </div>
  );
}