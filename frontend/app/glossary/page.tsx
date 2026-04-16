// Created by Christella - 03/17/2026
// Poverty Glossary page — alphabetical + searchable
// Public: view terms. Logged-in: bookmark, mark as learned, add notes.
// Modified by Christella - 03/24/2026 - flip card animation (term front, definition back on hover)
//   My Terms panel cards do NOT flip so users can select text freely
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bookmark, BookmarkCheck, CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Economic:     { color: '#8CE4FF', bg: 'rgba(140,228,255,0.12)' },
  Social:       { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)'   },
  Policy:       { color: '#FFA239', bg: 'rgba(255,162,57,0.12)'  },
  Humanitarian: { color: '#FF5656', bg: 'rgba(255,86,86,0.12)'   },
};

type GlossaryTerm = {
  _id: string;
  term: string;
  definition: string;
  category: string;
  letter: string;
  relatedTerms?: string[];
};

type UserData = {
  termId: string;
  bookmarked: boolean;
  learned: boolean;
  note: string;
};

// ===== Addition by Christella - 04/15/2026 - FlipCard component =====
// Renders a card that flips on hover to reveal the definition.
// When noteOpen is true, flipping is disabled so the user can interact with the textarea.
function FlipCard({
  term,
  isDark,
  userEmail,
  ud,
  noteOpen,
  noteInput,
  onToggleBookmark,
  onToggleLearned,
  onToggleNote,
  onNoteChange,
  onSaveNote,
  onRelatedClick,
}: {
  term: GlossaryTerm;
  isDark: boolean;
  userEmail: string | null;
  ud: UserData | undefined;
  noteOpen: boolean;
  noteInput: string;
  onToggleBookmark: () => void;
  onToggleLearned: () => void;
  onToggleNote: () => void;
  onNoteChange: (v: string) => void;
  onSaveNote: () => void;
  onRelatedClick: (r: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<{ [key: string]: boolean }>({});
  const isBookmarked = ud?.bookmarked ?? false;
  const isLearned    = ud?.learned    ?? false;
  const catCfg       = CATEGORY_COLORS[term.category] || CATEGORY_COLORS['Economic'];
  const isExpanded = expandedTerms[term.term];
  // Keep the card on the front while the note panel is open
  useEffect(() => {
    if (noteOpen) setIsFlipped(false);
  }, [noteOpen]);

  const cardBorder = isLearned
    ? '#4CAF5040'
    : isBookmarked
    ? 'var(--color-cyan)'
    : isDark
    ? 'rgba(255,255,255,0.08)'
    : 'var(--color-gray-light)';

  const cardBg = isDark
    ? isLearned ? 'rgba(76,175,80,0.06)' : 'rgba(255,255,255,0.03)'
    : isLearned ? 'rgba(76,175,80,0.04)' : 'white';

  return (
    <div
      onClick={() => { if (!noteOpen) setIsFlipped(prev => !prev); }}
      style={{
        // Perspective container — enables 3D depth
        perspective: 900,
        minHeight: 200,
        // Expand when note is open so textarea isn't clipped
        height: noteOpen || (isFlipped && isExpanded) ? 'auto' : 200,
      }}
    >
      {/* Inner wrapper — this is what actually rotates */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: noteOpen || (isFlipped && isExpanded) ? 'auto' : '100%',
          minHeight: 200,
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.45s ease',
        }}
      >

        {/* ── FRONT FACE ── term + badges + action buttons */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.2rem',
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textAlign: 'center',
            justifyContent: 'center',
            transition: 'border-color var(--transition-base)',
          }}
        >
                    {/* Top-left: category */}
          <div style={{ position: 'absolute', top: 14, left: 16 }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.28rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              background: catCfg.bg,
              color: catCfg.color,
              border: `1px solid ${catCfg.color}30`,
            }}>
              {term.category}
            </span>
          </div>

          {/* Top-right: action buttons */}
          {userEmail && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                gap: 4,
                zIndex: 2,
              }}
            >
              <button
                onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: isBookmarked ? 'var(--color-cyan)' : 'var(--color-gray)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {isBookmarked
                  ? <BookmarkCheck style={{ width: 18, height: 18 }} />
                  : <Bookmark style={{ width: 18, height: 18 }} />}
              </button>

              <button
                onClick={e => { e.stopPropagation(); onToggleLearned(); }}
                title={isLearned ? 'Mark as not learned' : 'Mark as learned'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: isLearned ? '#4CAF50' : 'var(--color-gray)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {isLearned
                  ? <CheckCircle style={{ width: 18, height: 18 }} />
                  : <Circle style={{ width: 18, height: 18 }} />}
              </button>

              <button
                onClick={e => { e.stopPropagation(); onToggleNote(); }}
                title="Add note"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: ud?.note ? 'var(--color-orange)' : 'var(--color-gray)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {noteOpen
                  ? <ChevronUp style={{ width: 15, height: 15 }} />
                  : <ChevronDown style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          )}

          {/* Centered term */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              paddingTop: '1.4rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
            }}
          >
           <h3 style={{fontSize: '1.9rem', fontWeight: 800, color: 'var(--foreground)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em',}}>
              {term.term}
            </h3>

            {isLearned && (
              <span style={{
                marginTop: 10,
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.28rem 0.7rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(76,175,80,0.12)',
                color: '#4CAF50',
                border: '1px solid rgba(76,175,80,0.3)',
              }}>
                ✓ Learned
              </span>
            )}
          </div>

          {/* Expandable note input — shown on front when noteOpen so user can interact freely */}
          {userEmail && noteOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <textarea
                placeholder="Add a personal note…"
                rows={3}
                value={noteInput}
                onChange={e => onNoteChange(e.target.value)}
                style={{
                  width: '100%', padding: '0.5rem 0.7rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-cyan)',
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                  color: 'var(--foreground)', fontSize: '0.78rem',
                  resize: 'none', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={onSaveNote}
                style={{
                  alignSelf: 'flex-end', padding: '0.3rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-cyan)', color: 'var(--background)',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                Save note
              </button>
              {ud?.note && (
                <p style={{ fontSize: '0.72rem', color: 'var(--color-gray)', fontStyle: 'italic', margin: 0 }}>
                  Saved: {ud.note}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── BACK FACE ── definition + related terms */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.2rem',
            background: isDark ? 'rgba(255,255,255,0.05)' : catCfg.bg,
            border: `1.5px solid ${catCfg.color}50`,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflow: isExpanded ? 'visible' : 'auto',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >

          {/* Definition */}
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-gray)',
              display: isExpanded ? 'block' : '-webkit-box',
              WebkitLineClamp: isExpanded ? undefined : 3,
              WebkitBoxOrient: isExpanded ? undefined : 'vertical',
              overflow: isExpanded ? 'visible' : 'hidden',
              width: '100%',
              margin: 0,
            }}
          >
            {term.definition}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedTerms(prev => ({
                ...prev,
                [term.term]: !prev[term.term],
              }));
            }}
            style={{
              marginTop: 6,
              fontSize: '0.8rem',
              color: 'var(--foreground)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {isExpanded ? 'See less' : 'See more'}
          </button>

          {/* Related terms */}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-gray)', marginRight: 2 }}>See also:</span>
              {term.relatedTerms.map(r => (
                <button
                  key={r}
                  onClick={() => onRelatedClick(r)}
                  style={{
                    fontSize: '0.65rem', fontWeight: 500,
                    padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)',
                    background: 'rgba(0,0,0,0.07)', color: 'var(--color-gray-dark)',
                    border: '1px solid var(--color-gray-light',
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-red)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-red)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gray-light)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-gray-dark)';
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ===== End of addition by Christella - 04/15/2026 =====

export default function GlossaryPage() {
  const [terms, setTerms]           = useState<GlossaryTerm[]>([]);
  const [filtered, setFiltered]     = useState<GlossaryTerm[]>([]);
  const [search, setSearch]         = useState('');
  const [activeLetter, setActiveLetter] = useState<string>('all');
  const [loading, setLoading]       = useState(true);
  const [isDark, setIsDark]         = useState(false);
  const [userEmail, setUserEmail]   = useState<string | null>(null);
  const [userData, setUserData]     = useState<Record<string, UserData>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [expandedMyTerms, setExpandedMyTerms] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  // Fetch all terms on mount
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/glossary`);
        const data = await res.json();
        if (data.success) {
          setTerms(data.terms);
          setFiltered(data.terms);
        }
      } catch (err) {
        console.error('Error fetching glossary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  // Fetch user's saved data if logged in
  useEffect(() => {
    if (!userEmail) return;
    const fetchUserData = async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/glossary/userdata/${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.success) {
          const map: Record<string, UserData> = {};
          data.data.forEach((d: UserData) => { map[d.termId] = d; });
          setUserData(map);
        }
      } catch (err) {
        console.error('Error fetching user glossary data:', err);
      }
    };
    fetchUserData();
  }, [userEmail]);

  // Filter terms whenever search or letter changes
  useEffect(() => {
    let result = [...terms];
    if (activeLetter !== 'all') {
      result = result.filter(t => t.letter === activeLetter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeLetter, terms]);

  // Save a user action (bookmark, learned, or note) to the backend
  const saveUserAction = async (termId: string, patch: Partial<UserData>) => {
    if (!userEmail) return;
    try {
      await fetch(`${BACKEND_URL}/api/glossary/${termId}/userdata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, ...patch }),
      });
      setUserData(prev => ({
        ...prev,
        [termId]: { ...{ termId, bookmarked: false, learned: false, note: '' }, ...prev[termId], ...patch },
      }));
    } catch (err) {
      console.error('Error saving user glossary action:', err);
    }
  };

  const toggleBookmark = (termId: string) => {
    const current = userData[termId]?.bookmarked ?? false;
    saveUserAction(termId, { bookmarked: !current });
  };

  const toggleLearned = (termId: string) => {
    const current = userData[termId]?.learned ?? false;
    saveUserAction(termId, { learned: !current });
  };

  const saveNote = (termId: string) => {
    saveUserAction(termId, { note: noteInputs[termId] ?? '' });
    setExpandedNote(null);
  };

  // Group filtered terms by letter for the alphabetical display
  const grouped = LETTERS.reduce<Record<string, GlossaryTerm[]>>((acc, l) => {
    const group = filtered.filter(t => t.letter === l);
    if (group.length) acc[l] = group;
    return acc;
  }, {});

  // Stats for logged-in users
  const bookmarkedCount = Object.values(userData).filter(d => d.bookmarked).length;
  const learnedCount    = Object.values(userData).filter(d => d.learned).length;

  // My Terms panel — derives the actual term objects from userData
  const [myTermsTab, setMyTermsTab] = useState<'saved' | 'learned'>('saved');
  const savedTerms  = terms.filter(t => userData[t._id]?.bookmarked);
  const learnedTerms = terms.filter(t => userData[t._id]?.learned);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', paddingTop: 40, paddingLeft: 80, paddingRight: 80 }}>

      {/* Header */}
      <header style={{ marginBottom: 32, paddingLeft: 24 }}>
        <h1 className="text-4xl sm:text-5xl font-bold" style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}>
          Poverty Glossary
        </h1>
        <div style={{ height: 4, width: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cyan-yellow)', margin: '0 0 24px 0' }} />
        {/*Modified to explain how to use the Glossary.*/}
        <p style={{ margin: 0, fontSize: 20, lineHeight: 1.7, color: 'var(--color-gray-dark)' }}>
          Definitions for key terms related to poverty, economic inequality, and global development. To view the definitions, simply click on the card. When you are done, click on the card again to reset it.
        </p>
        {!userEmail && (
          <p style={{ margin: '8px 0 0 0', fontSize: 16, color: 'var(--color-gray)' }}>
            <a href="/signin" style={{ color: 'var(--color-cyan)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
            {' '}to bookmark terms, mark them as learned, and add personal notes.
          </p>
        )}
      </header>

      {/* Logged-in stats bar */}
      {userEmail && (
        <div style={{ paddingLeft: 24, marginBottom: 32, display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-gray)' }}>
            <BookmarkCheck style={{ width: 16, height: 16, color: 'var(--color-cyan)' }} />
            <span><strong style={{ color: 'var(--foreground)' }}>{bookmarkedCount}</strong> bookmarked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--color-gray)' }}>
            <CheckCircle style={{ width: 16, height: 16, color: '#4CAF50' }} />
            <span><strong style={{ color: 'var(--foreground)' }}>{learnedCount}</strong> learned</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-gray)' }}>
            <strong style={{ color: 'var(--foreground)' }}>{terms.length}</strong> total terms
          </div>
        </div>
      )}

      {/* Search bar */}
      <div style={{ paddingLeft: 24, marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-gray)', pointerEvents: 'none' }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search terms or definitions…"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveLetter('all'); }}
            style={{
              width: '100%',
              paddingLeft: 40, paddingRight: search ? 36 : 16,
              paddingTop: '0.55rem', paddingBottom: '0.55rem',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${search ? 'var(--color-cyan)' : 'var(--color-gray-light)'}`,
              background: 'var(--color-gray-light)',
              color: 'var(--foreground)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color var(--transition-base)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray)', padding: 0 }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </div>

      {/* A–Z letter nav */}
      <div style={{ paddingLeft: 24, marginBottom: 40, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <button
          onClick={() => setActiveLetter('all')}
          style={{
            padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: activeLetter === 'all' ? 'var(--color-orange)' : 'var(--color-gray-light)',
            color: activeLetter === 'all' ? 'white' : 'var(--foreground)',
            border: `1.5px solid ${activeLetter === 'all' ? 'var(--color-orange)' : 'var(--color-gray-light)'}`,
            transition: 'all var(--transition-fast)',
          }}
        >
          All
        </button>
        {LETTERS.map(l => {
          const hasTerms = terms.some(t => t.letter === l);
          return (
            <button
              key={l}
              onClick={() => hasTerms ? setActiveLetter(l) : undefined}
              disabled={!hasTerms}
              style={{
                padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 600, cursor: hasTerms ? 'pointer' : 'default',
                background: activeLetter === l ? 'var(--color-cyan)' : 'var(--color-gray-light)',
                color: activeLetter === l ? 'var(--background)' : hasTerms ? 'var(--foreground)' : 'var(--color-gray)',
                border: `1.5px solid ${activeLetter === l ? 'var(--color-cyan)' : 'var(--color-gray-light)'}`,
                opacity: hasTerms ? 1 : 0.35,
                transition: 'all var(--transition-fast)',
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {search && (
        <p style={{ paddingLeft: 24, marginBottom: 20, fontSize: 14, color: 'var(--color-gray)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Terms — flip cards */}
      {loading ? (
        <div style={{ paddingLeft: 24, color: 'var(--color-gray)', fontSize: 16 }}>Loading glossary…</div>
      ) : filtered.length === 0 ? (
        <div style={{ paddingLeft: 24, color: 'var(--color-gray)', fontSize: 16 }}>No terms found.</div>
      ) : (
        <div style={{ paddingLeft: 24, paddingBottom: 80 }}>
          {Object.entries(grouped).map(([letter, letterTerms]) => (
            <div key={letter} style={{ marginBottom: 40 }}>
              {/* Letter heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-orange)', lineHeight: 1, minWidth: 28 }}>
                  {letter}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-gray-light)' }} />
              </div>

              {/* Flip term cards - Added by Christella - 04/15/2026 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {letterTerms.map(term => (
                  <FlipCard
                    key={term._id}
                    term={term}
                    isDark={isDark}
                    userEmail={userEmail}
                    ud={userData[term._id]}
                    noteOpen={expandedNote === term._id}
                    noteInput={noteInputs[term._id] ?? ''}
                    onToggleBookmark={() => toggleBookmark(term._id)}
                    onToggleLearned={() => toggleLearned(term._id)}
                    onToggleNote={() => {
                      setExpandedNote(expandedNote === term._id ? null : term._id);
                      setNoteInputs(prev => ({ ...prev, [term._id]: userData[term._id]?.note ?? '' }));
                    }}
                    onNoteChange={v => setNoteInputs(prev => ({ ...prev, [term._id]: v }))}
                    onSaveNote={() => saveNote(term._id)}
                    onRelatedClick={r => { setSearch(r); setActiveLetter('all'); }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Terms panel — NO flip cards here so users can freely select/read text */}
      {userEmail && (savedTerms.length > 0 || learnedTerms.length > 0) && (
        <div style={{ paddingLeft: 24, paddingBottom: 80 }}>

          {/* Section divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-white)', lineHeight: 1 }}>My Terms</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-gray-light)' }} />
          </div>

          <div style={{
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-gray-light)',
            overflow: 'hidden',
          }}>
            {/* Tab header */}
            <div style={{ display: 'flex', borderBottom: '1.5px solid var(--color-gray-light)' }}>
              <button
                onClick={() => setMyTermsTab('saved')}
                style={{
                  flex: 1, padding: '0.75rem 1rem',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  background: myTermsTab === 'saved' ? 'var(--color-gray-light)' : 'transparent',
                  color: myTermsTab === 'saved' ? 'var(--color-cyan)' : 'var(--color-gray)',
                  border: 'none',
                  borderBottom: myTermsTab === 'saved' ? '2px solid var(--color-cyan)' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <BookmarkCheck style={{ width: 15, height: 15 }} />
                Saved ({savedTerms.length})
              </button>
              <button
                onClick={() => setMyTermsTab('learned')}
                style={{
                  flex: 1, padding: '0.75rem 1rem',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  background: myTermsTab === 'learned' ? 'var(--color-gray-light)' : 'transparent',
                  color: myTermsTab === 'learned' ? '#4CAF50' : 'var(--color-gray)',
                  border: 'none',
                  borderBottom: myTermsTab === 'learned' ? '2px solid #4CAF50' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <CheckCircle style={{ width: 15, height: 15 }} />
                Learned ({learnedTerms.length})
              </button>
            </div>

            {/* Tab content — plain cards, no flip */}
            <div style={{ padding: '1.2rem', background: isDark ? 'rgba(255,255,255,0.02)' : 'var(--color-gray-light)' }}>
              {(() => {
                const list = myTermsTab === 'saved' ? savedTerms : learnedTerms;
                if (list.length === 0) {
                  return (
                    <p style={{ fontSize: 14, color: 'var(--color-gray)', textAlign: 'center', padding: '1rem 0' }}>
                      {myTermsTab === 'saved'
                        ? 'No saved terms yet — click the bookmark icon on any term.'
                        : 'No learned terms yet — click the circle icon on any term.'}
                    </p>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {list.map(term => {
                      const catCfg = CATEGORY_COLORS[term.category] || CATEGORY_COLORS['Economic'];
                      const ud     = userData[term._id];
                      return (
                        // No hover flip — plain static card so user can select/read text freely
                        <div
                          key={term._id}
                          style={{
                            borderRadius: 'var(--radius-md)',
                            padding: '0.6rem 0.9rem',
                            background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
                            border: `1.5px solid ${myTermsTab === 'saved' ? 'var(--color-cyan)' : '#4CAF5050'}`,
                            display: 'flex', flexDirection: 'column', gap: 6,
                            textAlign: 'center', alignItems: 'center',
                            minWidth: 180, maxWidth: 260, flex: '1 1 180px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--foreground)' }}>
                              {term.term}
                            </span>
                            <span style={{
                              fontSize: '0.58rem', fontWeight: 600,
                              padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)',
                              background: catCfg.bg, color: catCfg.color,
                            }}>
                              {term.category}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '0.82rem', lineHeight: 1.6,
                            color: 'var(--foreground)', opacity: 0.7, margin: 0,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: expandedMyTerms[term._id] ? 'unset' : 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {term.definition}
                          </p>
                          {term.definition.length > 110 && (
                            <button
                              onClick={() => setExpandedMyTerms(prev => ({ ...prev, [term._id]: !prev[term._id] }))}
                              style={{
                                marginTop: 2,
                                fontSize: '0.76rem',
                                color: 'var(--color-cyan)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                fontWeight: 600,
                              }}
                            >
                              {expandedMyTerms[term._id] ? 'See less' : 'See more'}
                            </button>
                          )}
                          {ud?.note && (
                            <p style={{ fontSize: '0.68rem', color: 'var(--color-orange)', fontStyle: 'italic', margin: 0 }}>
                              Notes: {ud.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// End of creation by Christella - 3/17/2026