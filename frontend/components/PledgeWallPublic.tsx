// Created by Christella - 03/17/2026
// Public-facing bento pledge showcase for the home page (view only, no form)
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Users, Megaphone, Leaf, CheckCircle, ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type Pledge = {
  _id: string;
  pledgeText: string;
  category: string;
  username: string;
  completed: boolean;
  createdAt: string;
};

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  donate:             { color: '#FF5656', bg: 'rgba(255,86,86,0.12)',    icon: <Heart    className="w-3.5 h-3.5" />, label: 'Donate'           },
  volunteer:          { color: '#8CE4FF', bg: 'rgba(140,228,255,0.12)', icon: <Users    className="w-3.5 h-3.5" />, label: 'Volunteer'        },
  'spread awareness': { color: '#FFA239', bg: 'rgba(255,162,57,0.12)',  icon: <Megaphone className="w-3.5 h-3.5" />, label: 'Spread Awareness' },
  'lifestyle change': { color: '#D4B800', bg: 'rgba(212,184,0,0.12)',   icon: <Leaf     className="w-3.5 h-3.5" />, label: 'Lifestyle Change' },
};

// Column widths only — no row-span so cards size to their own content, no gaps.
const BENTO_SIZES = [
  'lg:col-span-2', // wide
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-2', // wide
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-2', // wide
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-2', // wide
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
  'lg:col-span-1', // normal
];

// Returns `n` randomly selected items from `arr` using Fisher-Yates shuffle
function randomSample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function PledgeWallPublic() {
  const [allPledges, setAllPledges] = useState<Pledge[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch all pledges once on mount
  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/pledges`);
        const data = await res.json();
        if (data.success) {
          setTotalCount(data.pledges.length);
          setAllPledges(data.pledges);
          setPledges(randomSample(data.pledges, 20));
        }
      } catch (err) {
        console.error('Error fetching pledges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPledges();
  }, []);

  // Rotate to a new random batch every 30 seconds
  useEffect(() => {
    if (allPledges.length === 0) return;
    const interval = setInterval(() => {
      setPledges(randomSample(allPledges, 20));
    }, 30000);
    return () => clearInterval(interval);
  }, [allPledges]);

  return (
    <section style={{ paddingTop: 0, paddingBottom: 64, backgroundColor: 'var(--background)' }}>

      {/* Divider line to separate from the section above */}
      <div style={{ height: 1, background: 'var(--color-gray-light)', marginBottom: 48 }} />

      {/* Section header — centered */}
      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <h2
          className="text-4xl sm:text-5xl font-bold"
          style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}
        >
          Pledge Wall
        </h2>
        <div style={{ height: 4, width: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cyan-yellow)', margin: '0 auto 24px auto' }} />
        <p style={{ margin: '0 auto 24px auto', fontSize: 20, lineHeight: 1.7, color: 'var(--color-gray-dark)', whiteSpace: 'nowrap' }}>
          Real commitments from real people. Join the community taking action against poverty.
          {totalCount > 0 && (
            <span style={{ marginLeft: 8, fontSize: 16, color: 'var(--color-gray)' }}>
              {totalCount.toLocaleString()} pledge{totalCount !== 1 ? 's' : ''} and counting.
            </span>
          )}
        </p>

        {/* Sign in/sign up CTA */}
        <Link
          href="/signin"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.6rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-orange-red)',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: 'var(--shadow-md)',
            transition: 'opacity var(--transition-fast)',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Sign up / Log in to make a pledge <ArrowRight style={{ width: 15, height: 15 }} />
        </Link>
      </header>

      {/* Bento grid */}
      {loading ? (
        // Skeleton placeholders while loading
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={BENTO_SIZES[i % BENTO_SIZES.length]}
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-gray-light)',
                animation: 'pw-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : pledges.length === 0 ? (
        <div
          style={{
            textAlign: 'center', padding: '4rem 2rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-gray-light)',
            color: 'var(--color-gray)',
          }}
        >
          <p style={{ fontSize: 18 }}>No pledges yet — be the first!</p>
          <Link href="/signin" style={{ color: 'var(--color-orange)', fontWeight: 600, fontSize: 14, marginTop: 12, display: 'inline-block' }}>
            Sign up to post the first pledge →
          </Link>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {pledges.map((pledge, i) => {
            const cfg = CATEGORY_CONFIG[pledge.category] || CATEGORY_CONFIG['donate'];
            const sizeClass = BENTO_SIZES[i % BENTO_SIZES.length];

            return (
              <div
                key={pledge._id}
                className={sizeClass}
                style={{
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem 1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                  border: `1.5px solid ${cfg.color}28`,
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${cfg.color}70`;
                  el.style.boxShadow = `var(--shadow-md)`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${cfg.color}28`;
                  el.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Top row: category badge + completed badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.65rem', fontWeight: 600,
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.color}30`,
                  }}>
                    {cfg.icon}{cfg.label}
                  </div>
                  {pledge.completed && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: '0.62rem', fontWeight: 600,
                      padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
                      background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                    }}>
                      <CheckCircle style={{ width: 10, height: 10 }} />Completed
                    </span>
                  )}
                </div>

                {/* Pledge text */}
                <p style={{
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                  color: 'var(--foreground)',
                  opacity: pledge.completed ? 0.55 : 0.9,
                  textDecoration: pledge.completed ? 'line-through' : 'none',
                  flex: 1,
                  margin: '0.6rem 0',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                }}>
                  &ldquo;{pledge.pledgeText}&rdquo;
                </p>

                {/* Bottom row: username + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: cfg.color }}>
                    — {pledge.username}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-gray)', marginLeft: 'auto' }}>
                    {new Date(pledge.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}


      <style>{`
        @keyframes pw-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.5; } }
      `}</style>
    </section>
  );
}
// End of creation by Christella - 03/17/2026