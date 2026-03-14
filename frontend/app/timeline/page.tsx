// Created by Christella - 03/13/2026
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ExternalLink, Filter, Clock, Zap, CloudRain,
  Swords, Heart, TrendingDown, Leaf, ChevronLeft, ChevronRight,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Dot always sits at CONTENT_H + SPINE_H/2 = CARD_H/2, matching top:50% on the center line.
const CARD_W      = 300;
const CONTENT_H   = 210;
const SPINE_H     = 120;
const DOT_SIZE    = 16;
const CARD_GAP    = 44;
const CARD_H      = CONTENT_H * 2 + SPINE_H;
const CONN_H      = SPINE_H / 2 - DOT_SIZE / 2;     
const YEAR_OFFSET = 8;

// Types
type Category =
  | 'all' | 'Famine' | 'Policy & Law' | 'Breakthrough'
  | 'Natural Disaster' | 'War & Conflict' | 'Aid & Relief' | 'Economic Crisis';

type TimelineEvent = {
  _id: string;
  year: number;
  title: string;
  description: string;
  category: string;
  source?: string;
  sourceLabel?: string;
};

// Category colors - used for timeline purposes only
const CATEGORY_CONFIG = {
  Famine:             { color: 'var(--color-red)',    rawColor: '#FF5656', icon: <Leaf         className="w-4 h-4" />, label: 'Famine'           },
  'Policy & Law':     { color: 'var(--color-cyan)',   rawColor: '#8CE4FF', icon: <Clock        className="w-4 h-4" />, label: 'Policy & Law'     },
  Breakthrough:       { color: '#4CAF50',             rawColor: '#4CAF50', icon: <Zap          className="w-4 h-4" />, label: 'Breakthrough'     },
  'Natural Disaster': { color: 'var(--color-orange)', rawColor: '#FFA239', icon: <CloudRain    className="w-4 h-4" />, label: 'Natural Disaster' },
  'War & Conflict':   { color: '#CF6679',             rawColor: '#CF6679', icon: <Swords       className="w-4 h-4" />, label: 'War & Conflict'   },
  'Aid & Relief':     { color: 'var(--color-yellow)', rawColor: '#FEEE91', icon: <Heart        className="w-4 h-4" />, label: 'Aid & Relief'     },
  'Economic Crisis':  { color: '#B388FF',             rawColor: '#B388FF', icon: <TrendingDown className="w-4 h-4" />, label: 'Economic Crisis'  },
} as const;

type CfgKey = keyof typeof CATEGORY_CONFIG;
type Cfg    = (typeof CATEGORY_CONFIG)[CfgKey];

// Card Body code
function CardBody({ event, cfg }: { event: TimelineEvent; cfg: Cfg }) {
  return (
    <div
      style={{
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '0.9rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
        background: 'var(--color-gray-light)',
        border: `1.5px solid ${cfg.rawColor}40`,
        overflow: 'hidden',
        transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = cfg.rawColor;
        el.style.boxShadow   = `0 0 18px ${cfg.rawColor}44`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${cfg.rawColor}40`;
        el.style.boxShadow   = 'none';
      }}
    >
      {/* Category badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.18rem 0.6rem', borderRadius: 'var(--radius-full)',
        fontSize: '0.68rem', fontWeight: 600, alignSelf: 'flex-start', flexShrink: 0,
        background: `${cfg.rawColor}18`, color: cfg.color, border: `1px solid ${cfg.rawColor}40`,
      }}>
        {cfg.icon}{cfg.label}
      </div>

      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.35, flexShrink: 0, color: 'var(--foreground)' }}>
        {event.title}
      </h3>

      <p style={{ fontSize: '0.72rem', lineHeight: 1.55, color: 'var(--foreground)', opacity: 0.75, flex: 1, overflow: 'hidden' }}>
        {event.description}
      </p>

      {event.source && (
        <a
          href={event.source} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 500, color: cfg.color, flexShrink: 0, marginTop: 'auto' }}
        >
          <ExternalLink style={{ width: 11, height: 11 }} />
          {event.sourceLabel || 'Source'}
        </a>
      )}
    </div>
  );
}

// TimelineCard
function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const cfg: Cfg = CATEGORY_CONFIG[event.category as CfgKey] ?? CATEGORY_CONFIG['Policy & Law'];
  const isTop = index % 2 === 0;

  return (
    <div style={{ width: CARD_W, height: CARD_H, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Top content half */}
      <div style={{ height: CONTENT_H, width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {isTop && <CardBody event={event} cfg={cfg} />}
      </div>

      {/* Spine — connector, dot, and year label all absolutely positioned */}
      <div style={{ height: SPINE_H, width: '100%', flexShrink: 0, position: 'relative' }}>

        {/* Connector bar */}
        <div style={{
          position: 'absolute',
          ...(isTop ? { top: 0 } : { bottom: 0 }),
          left: '50%', transform: 'translateX(-50%)',
          width: 2, height: CONN_H,
          background: cfg.color, opacity: 0.65,
        }} />

        {/* Dot — centred at SPINE_H/2, sits exactly on the center line */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%',
          background: cfg.color,
          border: `2.5px solid var(--background)`,
          boxShadow: `0 0 0 3px ${cfg.rawColor}33, 0 0 12px ${cfg.rawColor}66`,
          zIndex: 2,
        }} />

        {/* Year label — below dot for top cards, above dot for bottom cards */}
        <span style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          ...(isTop
            ? { top: SPINE_H / 2 + DOT_SIZE / 2 + YEAR_OFFSET }
            : { bottom: SPINE_H / 2 + DOT_SIZE / 2 + YEAR_OFFSET }),
          fontSize: 28, fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap',
          color: cfg.color,
          userSelect: 'none',
        }}>
          {event.year}
        </span>
      </div>

      {/* Bottom content half */}
      <div style={{ height: CONTENT_H, width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        {!isTop && <CardBody event={event} cfg={cfg} />}
      </div>
    </div>
  );
}

// Filter Chips
function FilterChip({ active, onClick, color, children }: {
  active: boolean; onClick: () => void; color: string; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)',
      fontSize: '0.78rem', fontWeight: 500, flexShrink: 0,
      background: active ? color : 'var(--color-gray-light)',
      border: `1.5px solid ${active ? color : 'var(--color-gray-dark)'}`,
      color: active ? 'var(--background)' : 'var(--foreground)',
      transition: 'all var(--transition-fast)',
      opacity: active ? 1 : 0.72,
    }}>
      {children}
    </button>
  );
}

// Scroll arrow for timeline
function ScrollArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={`Scroll ${direction}`} style={{
      position: 'absolute', [direction]: 16, top: '50%', transform: 'translateY(-50%)',
      zIndex: 10, width: 36, height: 36, borderRadius: 'var(--radius-full)',
      background: 'var(--color-gray-light)', border: '1.5px solid var(--color-gray-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--foreground)', boxShadow: 'var(--shadow-md)',
      opacity: 0.8, transition: 'opacity var(--transition-fast)',
    }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
    >
      {direction === 'left'
        ? <ChevronLeft  style={{ width: 18, height: 18 }} />
        : <ChevronRight style={{ width: 18, height: 18 }} />}
    </button>
  );
}

// Timeline page
export default function TimelinePage() {
  const [events, setEvents]       = useState<TimelineEvent[]>([]);
  const [activeFilter, setFilter] = useState<Category>('all');
  const [loading, setLoading]     = useState(true);
  const scrollRef                 = useRef<HTMLDivElement>(null);

  // Fetch events on filter change; cancels stale in-flight requests
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const url = activeFilter === 'all'
        ? `${BACKEND_URL}/api/timeline`
        : `${BACKEND_URL}/api/timeline?category=${encodeURIComponent(activeFilter)}`;
      try {
        const res  = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setEvents(data.events);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeFilter]);

  const scrollBy = useCallback((dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? CARD_W + CARD_GAP : -(CARD_W + CARD_GAP), behavior: 'smooth' });
  }, []);

  // Non-passive wheel listener: redirects vertical scroll → horizontal, preventing the page from also scrolling vertically.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollBy('right');
      if (e.key === 'ArrowLeft')  scrollBy('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scrollBy]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', paddingTop: 40, paddingLeft: 80, paddingRight: 80 }}>

      {/* Header */}
      <header style={{ marginBottom: 32, paddingLeft: 24 }}>
        <h1 className="text-4xl sm:text-5xl font-bold" style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}>
          Poverty Timeline
        </h1>
        <div style={{ height: 4, width: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cyan-yellow)', margin: '0 0 24px 0' }} />
        <p style={{ margin: 0, fontSize: 20, lineHeight: 1.7, color: 'var(--color-gray-dark)' }}>
          This poverty timeline highlights major historical events, policy shifts,
          crises, and relief efforts that have shaped poverty across the world.
          Explore key moments from famines and natural disasters to breakthroughs
          and international aid efforts that have defined the global fight against poverty.
        </p>
        <p style={{ margin: '16px 0 0 0', fontSize: 20, lineHeight: 1.7, color: 'var(--color-gray-dark)' }}>
          Disclaimer: All events and sources are presented for informational and educational
          purposes only. PovertyLens does not claim ownership of or credit for any
          third-party information — sources are linked directly on each card.
        </p>
      </header>

      {/* Category filter chips — centered, wraps at narrow widths */}
      <div style={{ paddingBottom: 48 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <FilterChip active={activeFilter === 'all'} onClick={() => setFilter('all')} color="var(--color-orange)">
            <Filter style={{ width: 13, height: 13 }} />All Events
          </FilterChip>
          {(Object.entries(CATEGORY_CONFIG) as [CfgKey, Cfg][]).map(([key, cfg]) => (
            <FilterChip key={key} active={activeFilter === key} onClick={() => setFilter(key as Category)} color={cfg.color}>
              {cfg.icon}{cfg.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingBottom: 40 }}>

        <ScrollArrow direction="left"  onClick={() => scrollBy('left')}  />
        <ScrollArrow direction="right" onClick={() => scrollBy('right')} />

        <div style={{ position: 'relative' }}>

          {/* Left/right ombre fades using the page background color */}
          <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 80, height: '100%', background: 'linear-gradient(to right, var(--background), transparent)', zIndex: 3, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: 80, height: '100%', background: 'linear-gradient(to left, var(--background), transparent)', zIndex: 3, pointerEvents: 'none' }} />

          {/* Center line — top:50% of CARD_H equals the dot center */}
          <div aria-hidden style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--color-gray)', opacity: 0.2, pointerEvents: 'none', zIndex: 0 }} />

          {/* Horizontal scroll container */}
          <div
            ref={scrollRef}
            tabIndex={0}
            style={{
              display: 'flex', gap: CARD_GAP,
              overflowX: 'scroll', overflowY: 'hidden',
              height: CARD_H, alignItems: 'center',
              paddingLeft: 64, paddingRight: 64,
              position: 'relative', zIndex: 1,
              scrollbarWidth: 'none', outline: 'none',
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ width: CARD_W, height: CARD_H, flexShrink: 0, display: 'flex', alignItems: i % 2 === 0 ? 'flex-end' : 'flex-start', paddingBottom: i % 2 === 0 ? SPINE_H : 0, paddingTop: i % 2 === 0 ? 0 : SPINE_H }}>
                    <div style={{ width: '100%', height: CONTENT_H, borderRadius: 'var(--radius-lg)', background: 'var(--color-gray-light)', animation: 'tl-pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
                  </div>
                ))
              : events.map((event, index) => (
                  <TimelineCard key={event._id} event={event} index={index} />
                ))}
          </div>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes tl-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.55; } }
      `}</style>
    </div>
  );
}