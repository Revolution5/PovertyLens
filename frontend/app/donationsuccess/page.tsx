// Created by Christella - 03/03/2026
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Home, ArrowRight, Sparkles } from 'lucide-react';

export default function DonationSuccessPage() {
  const router = useRouter();

  // Dark mode detection - Added by Christella - 03/03/2026
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: isDark
          ? 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.05), rgba(254, 238, 145, 0.05), rgba(255, 162, 57, 0.05))'
          : 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.1), rgba(254, 238, 145, 0.1), rgba(255, 162, 57, 0.1))',
        backgroundColor: 'var(--background)',
      }}
    >
      <div
        className="w-full max-w-lg text-center rounded-2xl p-10"
        style={{
          backgroundColor: 'var(--background)',
          border: '1px solid var(--color-gray-light)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Animated heart icon */}
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gradient-orange-red)' }}
        >
          <Heart className="w-12 h-12 text-white" fill="white" />
        </div>

        {/* Heading */}
        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          Thank You!
        </h1>

        {/* Divider */}
        <div
          style={{
            height: 4,
            width: 80,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-orange-red)',
            margin: '0 auto 24px',
          }}
        />

        <p
          className="text-lg mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Your donation was processed successfully.
        </p>
        <p
          className="text-base mb-8"
          style={{ color: 'var(--color-gray)' }}
        >
          You&apos;re making a real difference in the lives of people living in poverty around the
          world. A confirmation will be sent to your email.
        </p>

        {/* Impact reminder */}
        <div
          className="rounded-xl p-4 mb-8 flex items-center gap-3"
          style={{
            backgroundColor: isDark ? 'rgba(255, 162, 57, 0.1)' : '#fff7ed',
            border: '1px solid var(--color-orange)',
          }}
        >
          <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-orange)' }} />
          <p className="text-sm text-left" style={{ color: 'var(--color-gray-dark)' }}>
            95% of every donation goes directly to programs that fight poverty and support
            communities in need.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              border: '1px solid var(--color-gray-light)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--background)';
            }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>

          <button
            onClick={() => router.push('/PLdonation')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: 'var(--gradient-orange-red)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Heart className="w-4 h-4" />
            Donate Again
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}