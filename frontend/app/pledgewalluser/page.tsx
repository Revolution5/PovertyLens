// Created by Christella - 03/05/2026
'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Users, CheckCircle, Plus, Filter, Sparkles, HandHeart, Megaphone, Leaf } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type Category = 'all' | 'donate' | 'volunteer' | 'spread awareness' | 'lifestyle change';

type Pledge = {
  _id: string;
  pledgeText: string;
  category: string;
  username: string;
  userEmail?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
};

type Preset = {
  text: string;
  category: string;
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

export default function PledgeWallPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [pledgeText, setPledgeText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('donate');
  const [displayName, setDisplayName] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('username');
    setUserEmail(email);
    setUsername(name);
  }, []);

  useEffect(() => { fetchPledges(); }, [activeFilter]);

  useEffect(() => { fetchCounts(); }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/pledges/presets`)
      .then(r => r.json())
      .then(data => { if (data.success) setPresets(data.presets); })
      .catch(err => console.error('Error fetching presets:', err));
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

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

  const handleSubmit = async () => {
    if (!pledgeText.trim()) {
      setMessage({ text: 'Please enter a pledge.', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${BACKEND_URL}/api/pledges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pledgeText, category: selectedCategory, userEmail, displayName, username }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.message || 'Error submitting pledge.', type: 'error' });
        return;
      }
      if (activeFilter === 'all' || activeFilter === selectedCategory) {
        setPledges(prev => [data.pledge, ...prev]);
      }
      setPledgeText('');
      setMessage({ text: '🎉 Your pledge has been added to the wall!', type: 'success' });
      fetchCounts();
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (pledge: Pledge) => {
    if (!userEmail) {
      setMessage({ text: 'You must be logged in to complete a pledge.', type: 'error' });
      return;
    }
    if (pledge.userEmail !== userEmail) {
      setMessage({ text: 'You can only complete your own pledges.', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/pledges/${pledge._id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.message || 'Error completing pledge.', type: 'error' });
        return;
      }
      setCelebratingId(pledge._id);
      setTimeout(() => setCelebratingId(null), 2000);
      setPledges(prev => prev.map(p => p._id === pledge._id ? { ...p, completed: true } : p));
      setMessage({ text: '🌟 Amazing! You completed your pledge!', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  const handlePresetClick = (preset: Preset) => {
    setPledgeText(preset.text);
    setSelectedCategory(preset.category);
  };

  const filteredPresets = presets.filter(p =>
    selectedCategory === 'all' || p.category === selectedCategory
  );

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
          Make a public commitment to take action against poverty. Every pledge counts.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {message && (
          <div
            className="mb-6 p-4 rounded-xl text-sm font-medium"
            style={{
              background: message.type === 'success' ? (isDark ? 'rgba(34,197,94,0.15)' : '#e8f5e9') : (isDark ? 'rgba(239,68,68,0.15)' : '#ffebee'),
              border: `1px solid ${message.type === 'success' ? (isDark ? 'rgba(34,197,94,0.4)' : '#66bb6a') : (isDark ? 'rgba(239,68,68,0.4)' : '#ef5350')}`,
              color: 'var(--foreground)',
            }}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column - Make a pledge */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-6"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'white',
                border: '1px solid var(--color-gray-light)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--foreground)' }}>Make a Pledge</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray)' }}>Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: selectedCategory === key ? cfg.bg : 'transparent',
                        border: `1.5px solid ${selectedCategory === key ? cfg.color : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')}`,
                        color: selectedCategory === key ? cfg.color : 'var(--color-gray)',
                      }}
                    >
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPresets.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray)' }}>Choose a preset</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetClick(preset)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg transition-all"
                        style={{
                          background: pledgeText === preset.text ? CATEGORY_CONFIG[preset.category]?.bg || 'rgba(140,228,255,0.1)' : (isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9'),
                          border: `1px solid ${pledgeText === preset.text ? CATEGORY_CONFIG[preset.category]?.color || '#8CE4FF' : (isDark ? 'rgba(255,255,255,0.08)' : '#eee')}`,
                          color: 'var(--foreground)',
                        }}
                      >
                        {preset.text}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-gray)' }}>Or write your own below ↓</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-gray)' }}>Your pledge</label>
                <textarea
                  value={pledgeText}
                  onChange={e => setPledgeText(e.target.value)}
                  placeholder="I will..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none transition-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                    border: `1.5px solid ${pledgeText ? 'var(--color-cyan)' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')}`,
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-cyan)'}
                  onBlur={e => e.target.style.borderColor = pledgeText ? 'var(--color-cyan)' : (isDark ? 'rgba(255,255,255,0.1)' : '#e0e0e0')}
                />
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--color-gray)' }}>{pledgeText.length}/300</p>
              </div>

              <div className="flex items-center justify-between mb-5">
                <span className="text-sm" style={{ color: 'var(--color-gray)' }}>Show my name</span>
                <button
                  onClick={() => setDisplayName(v => !v)}
                  className="relative w-10 h-5 rounded-full transition-all"
                  style={{ background: displayName ? 'var(--color-cyan)' : (isDark ? 'rgba(255,255,255,0.15)' : '#ccc') }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: displayName ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !pledgeText.trim()}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'var(--gradient-orange-red)',
                  color: 'white',
                  opacity: submitting || !pledgeText.trim() ? 0.7 : 1,
                  cursor: submitting || !pledgeText.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <Plus className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post My Pledge'}
              </button>
            </div>
          </div>

          {/* Right column - Pledge wall */}
          <div className="lg:col-span-2">

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
                <p>No pledges yet in this category. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pledges.map(pledge => (
                  <PledgeCard
                    key={pledge._id}
                    pledge={pledge}
                    userEmail={userEmail}
                    isDark={isDark}
                    celebrating={celebratingId === pledge._id}
                    onComplete={() => handleComplete(pledge)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
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

function PledgeCard({ pledge, userEmail, isDark, celebrating, onComplete }: {
  pledge: Pledge; userEmail: string | null; isDark: boolean; celebrating: boolean; onComplete: () => void;
}) {
  const cfg = CATEGORY_CONFIG[pledge.category] || CATEGORY_CONFIG['donate'];
  const isOwner = userEmail && pledge.userEmail === userEmail;

  return (
    <div
      className="rounded-2xl p-5 transition-all relative overflow-hidden"
      style={{
        background: celebrating ? (isDark ? 'rgba(254,238,145,0.1)' : 'rgba(254,238,145,0.3)') : (isDark ? 'rgba(255,255,255,0.03)' : 'white'),
        border: `1.5px solid ${celebrating ? '#FEEE91' : (pledge.completed ? cfg.color + '60' : (isDark ? 'rgba(255,255,255,0.08)' : '#efefef'))}`,
        boxShadow: celebrating ? '0 0 20px rgba(254,238,145,0.3)' : 'var(--shadow-sm)',
        transform: celebrating ? 'scale(1.01)' : 'scale(1)',
        transition: 'all 0.4s ease',
      }}
    >
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <Sparkles className="w-12 h-12 opacity-30" style={{ color: '#FEEE91' }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon}{cfg.label}
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--foreground)', textDecoration: pledge.completed ? 'line-through' : 'none', opacity: pledge.completed ? 0.6 : 1 }}>
            &ldquo;{pledge.pledgeText}&rdquo;
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium" style={{ color: 'var(--color-gray)' }}>— {pledge.username}</span>
            <span className="text-xs" style={{ color: 'var(--color-gray)' }}>
              {new Date(pledge.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {pledge.completed && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                <CheckCircle className="w-3 h-3" />Completed
              </span>
            )}
          </div>
        </div>
        {isOwner && !pledge.completed && (
          <button
            onClick={onComplete}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.4)', color: '#22c55e' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.12)'; }}
          >
            <CheckCircle className="w-3.5 h-3.5" />Done!
          </button>
        )}
      </div>
    </div>
  );
}
// End of creation by Christella - 03/06/2026