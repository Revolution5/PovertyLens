// Created by Christella - 03/08/2026
'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Users, CheckCircle, Filter, HandHeart, Megaphone, Leaf, LogIn } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type Category = 'all' | 'donate' | 'volunteer' | 'spread awareness' | 'lifestyle change';

type Pledge = {
  _id: string;
  pledgeText: string;
  category: string;
  username: string;
  completed: boolean;
  createdAt: string;
};

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  donate: {
    color: '#FF5656',
    bg: 'rgba(255,86,86,0.12)',
    icon: <Heart className="w-4 h-4" />,
    label: 'Donate',
  },
  volunteer: {
    color: '#8CE4FF',
    bg: 'rgba(140,228,255,0.12)',
    icon: <Users className="w-4 h-4" />,
    label: 'Volunteer',
  },
  'spread awareness': {
    color: '#FFA239',
    bg: 'rgba(255,162,57,0.12)',
    icon: <Megaphone className="w-4 h-4" />,
    label: 'Spread Awareness',
  },
  'lifestyle change': {
    color: '#FEEE91',
    bg: 'rgba(254,238,145,0.12)',
    icon: <Leaf className="w-4 h-4" />,
    label: 'Lifestyle Change',
  },
};

export default function PublicPledgeWallPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { fetchPledges(); }, [activeFilter]);

  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/pledges`);
      const data = await res.json();
      if (data.success) {
        const counts: Record<string, number> = { all: data.pledges.length };
        data.pledges.forEach((p: Pledge) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  const fetchPledges = async () => {
    setLoading(true);
    try {
      const url = activeFilter === 'all'
        ? `${BACKEND_URL}/api/pledges`
        : `${BACKEND_URL}/api/pledges?category=${encodeURIComponent(activeFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPledges(data.pledges);
    } catch (err) {
      console.error('Error fetching pledges:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl mb-4"
          style={{ fontWeight: 700, color: 'var(--foreground)' }}
        >
          Pledge Wall
        </h1>
        <div style={{ height: 4, width: 80, borderRadius: 9999, background: 'var(--gradient-cyan-yellow)', marginBottom: '1.5rem' }} />
        <p className="text-lg mb-4" style={{ color: 'var(--color-gray)' }}>
          See what the PovertyLens community is committing to. Every pledge makes a difference.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Login banner */}
        <div
          className="rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,162,57,0.1) 0%, rgba(255,86,86,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255,162,57,0.08) 0%, rgba(255,86,86,0.08) 100%)',
            border: '1.5px solid var(--color-orange)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-orange-red)' }}>
              <HandHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Want to make your own pledge?</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-gray)' }}>Sign in to post a pledge and join the community.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
            style={{ background: 'var(--gradient-orange-red)', color: 'white', boxShadow: 'var(--shadow-md)' }}
          >
            <LogIn className="w-4 h-4" />
            Sign In to Pledge
          </Link>
        </div>

        {/* Filter tabs with counts */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} color="var(--color-orange)" isDark={isDark}>
            <Filter className="w-3.5 h-3.5" />
            All {categoryCounts['all'] !== undefined ? `(${categoryCounts['all']})` : ''}
          </FilterChip>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <FilterChip
              key={key}
              active={activeFilter === key as Category}
              onClick={() => setActiveFilter(key as Category)}
              color={cfg.color}
              isDark={isDark}
            >
              <span>{cfg.icon}</span>
              {cfg.label} {categoryCounts[key] !== undefined ? `(${categoryCounts[key]})` : ''}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--color-gray)' }}>Loading pledges...</div>
        ) : pledges.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : '#f9f9f9',
              border: '1px dashed var(--color-gray-light)',
              color: 'var(--color-gray)',
            }}
          >
            <HandHeart className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="mb-4">No pledges yet in this category.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--gradient-orange-red)', color: 'white' }}
            >
              <LogIn className="w-4 h-4" />Sign in to be the first!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pledges.map(pledge => (
              <PublicPledgeCard key={pledge._id} pledge={pledge} isDark={isDark} />
            ))}
          </div>
        )}

        {pledges.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-sm mb-3" style={{ color: 'var(--color-gray)' }}>Inspired? Make your own pledge.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ background: 'var(--gradient-orange-red)', color: 'white', boxShadow: 'var(--shadow-md)' }}
            >
              <LogIn className="w-4 h-4" />Sign In to Pledge
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, color, isDark, children }: {
  active: boolean; onClick: () => void; color: string; isDark: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
      style={{
        background: active ? color : (isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5'),
        color: active ? (color === 'var(--color-orange)' || color === '#FFA239' ? 'white' : '#1a1a1a') : 'var(--color-gray)',
        border: `1.5px solid ${active ? color : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')}`,
      }}
    >
      {children}
    </button>
  );
}

function PublicPledgeCard({ pledge, isDark }: { pledge: Pledge; isDark: boolean }) {
  const cfg = CATEGORY_CONFIG[pledge.category] || CATEGORY_CONFIG['donate'];

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
        border: `1.5px solid ${pledge.completed ? cfg.color + '60' : (isDark ? 'rgba(255,255,255,0.08)' : '#efefef')}`,
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold self-start" style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.icon}{cfg.label}
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--foreground)', textDecoration: pledge.completed ? 'line-through' : 'none', opacity: pledge.completed ? 0.6 : 1 }}>
        &ldquo;{pledge.pledgeText}&rdquo;
      </p>
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}` }}>
        <span className="text-xs font-medium" style={{ color: 'var(--color-gray)' }}>— {pledge.username}</span>
        <div className="flex items-center gap-2">
          {pledge.completed && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <CheckCircle className="w-3 h-3" />Completed
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--color-gray)' }}>
            {new Date(pledge.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}