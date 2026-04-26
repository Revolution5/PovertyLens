// Created by Christella - 04/13/2026
// Updated by Reymes - 04/25/2026 - Improved accessibility, colorblind compatibility, and dark mode
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, CheckCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type CalendarEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  location: string;
  sourceUrl?: string;
  sourceLabel?: string;
  verified: boolean;
};

// reymes start - UI palette contrast updates
const TYPE_CONFIG: Record<string, { color: string; darkColor: string; bg: string; darkBg: string; label: string }> = {
  'Awareness Day': { 
    color: '#0066CC',      // Accessible blue
    darkColor: '#8CE4FF',
    bg: 'rgba(0,102,204,0.12)',
    darkBg: 'rgba(140,228,255,0.15)',
    label: 'Awareness Day'
  },
  'Volunteering': { 
    color: '#00A852',      // Accessible green
    darkColor: '#7CFFA1',
    bg: 'rgba(0,168,82,0.12)',
    darkBg: 'rgba(76,175,80,0.15)',
    label: 'Volunteering'
  },
  'Fundraiser': { 
    color: '#FF8C00',      // Accessible orange (higher contrast)
    darkColor: '#FFD27A',
    bg: 'rgba(255,140,0,0.12)',
    darkBg: 'rgba(255,162,57,0.15)',
    label: 'Fundraiser'
  },
  'Conference': { 
    color: '#7B3FF2',      // Accessible purple
    darkColor: '#D3B5FF',
    bg: 'rgba(123,63,242,0.12)',
    darkBg: 'rgba(179,136,255,0.15)',
    label: 'Conference'
  },
  'Campaign': { 
    color: '#CC0000',      // Accessible dark red (high contrast)
    darkColor: '#FF8A8A',
    bg: 'rgba(204,0,0,0.12)',
    darkBg: 'rgba(255,86,86,0.15)',
    label: 'Campaign'
  },
};
// reymes end - UI palette contrast updates

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AwarenessCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => { // added daniel q. 4/25/26 start
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('favoriteEvents');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
});
  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId];
      
      localStorage.setItem('favoriteEvents', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (eventId: string) => favorites.includes(eventId);  // added daniel q. 4/25/26 end

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/events`)
      .then(async r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setEvents(data.events);

          // Automatically jump to the first upcoming event month
          // so predefined events are visible when the calendar loads.
          const today = new Date();
          const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          const upcomingEvents = [...data.events]
            .filter((ev: CalendarEvent) => new Date(ev.date) >= startOfToday)
            .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());

          if (upcomingEvents.length > 0) {
            const firstUpcomingDate = new Date(upcomingEvents[0].date);
            setCurrentDate(new Date(firstUpcomingDate.getFullYear(), firstUpcomingDate.getMonth(), 1));
            setSelectedDay(firstUpcomingDate.getDate());
          } else if (data.events.length > 0) {
            const firstEventDate = new Date(data.events[0].date);
            setCurrentDate(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
            setSelectedDay(firstEventDate.getDate());
          }
        }
      })
      .catch(err => console.error('Error fetching events:', err))
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map of day -> events for the current month
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

  // Upcoming events across all months - next 5
  const upcoming = [...events]
    .filter(ev => new Date(ev.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--background)',
        border: '1px solid var(--color-gray-light)',
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.35)' : 'var(--shadow-lg)',
      }}
      role="region"
      aria-label="Awareness Calendar"
    >
      {/* reymes start - calendar surface readability in dark mode */}
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--color-gray-light)',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'var(--color-gray-light)',
        }}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" style={{ color: 'var(--color-cyan)' }} aria-hidden="true" />
          <h2 
            className="text-lg font-bold" 
            style={{ color: 'var(--foreground)' }}
            id="calendar-heading"
          >
            Awareness Calendar
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--color-gray-light)',
            }}
            aria-label={`Previous month`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span 
            className="text-sm font-semibold w-40 text-center" 
            style={{ color: 'var(--foreground)' }}
            aria-live="polite"
          >
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--color-gray-light)',
            }}
            aria-label={`Next month`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    <div className="flex flex-col lg:flex-row">

        {/* Calendar grid */}
        <div className="flex-1 p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3 gap-1">
            {DAYS.map(d => (
              <div
                key={d}
                className="text-center text-xs font-bold py-2 uppercase tracking-wider"
                style={{ color: 'var(--color-gray)' }}
                role="columnheader"
                aria-label={d}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} aria-hidden="true" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasEvents = !!eventsByDay[day];
              const isSelected = selectedDay === day;
              const isTodayDay = isToday(day);
              const dayEvents = eventsByDay[day] || [];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className="relative flex flex-col items-center justify-start rounded-xl py-2 px-1 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    minHeight: 50,
                    background: isSelected
                      ? '#005A9E'
                      : isTodayDay
                      ? (isDark ? 'rgba(255,162,57,0.2)' : 'rgba(255,162,57,0.15)')
                      : hasEvents
                      ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')
                      : 'transparent',
                    border: isSelected
                      ? '2px solid #003D6B'
                      : isTodayDay
                      ? '2px solid var(--color-orange)'
                      : '2px solid transparent',
                    boxShadow: isSelected ? (isDark ? '0 1px 4px rgba(0, 61, 107, 0.2)' : '0 2px 8px rgba(0, 61, 107, 0.35)') : 'none',
                    cursor: hasEvents ? 'pointer' : 'default',
                  }}
                  aria-label={`${MONTHS[month]} ${day}${isTodayDay ? ', today' : ''}${dayEvents.length > 0 ? `, ${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}` : ''}`}
                  aria-pressed={isSelected}
                  disabled={!hasEvents && !isTodayDay}
                >
                  <span
                    className="text-sm font-bold leading-tight"
                    style={{
                      color: isSelected ? 'white' : isTodayDay ? 'var(--color-orange)' : 'var(--foreground)',
                    }}
                  >
                    {day}
                  </span>

                  {/* Event indicators with dots */}
                  {/* reymes start - selected day contrast/readability */}
                  {hasEvents && (
                    <>
                      {/* reymes start - dot color legibility in dark mode */}
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center" aria-label={`${dayEvents.length} event indicator`}>
                        {dayEvents.slice(0, 3).map((ev, idx) => {
                          const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG['Campaign'];
                          return (
                            <div
                              key={idx}
                              className="w-2 h-2 rounded-full"
                              style={{ background: isSelected ? 'white' : (isDark ? cfg.darkColor : cfg.color) }}
                              title={ev.type}
                              aria-label={ev.type}
                            />
                          );
                        })}
                      </div>
                      {/* reymes end - dot color legibility in dark mode */}
                    </>
                  )}
                  {/* reymes end - selected day contrast/readability */}
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <div className="mt-6 space-y-3" role="region" aria-live="polite">
              <h3 
                className="text-xs font-bold uppercase tracking-wider" 
                style={{ color: 'var(--color-gray)' }}
              >
                Selected Date: {MONTHS[month]} {selectedDay}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No events this day.</p>
              ) : (
                selectedEvents.map(ev => <EventCard key={ev._id} event={ev} isDark={isDark} isFavorite={isFavorite(ev._id)} onToggleFavorite={() => toggleFavorite(ev._id)} />)
              )}
            </div>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div
            className="lg:w-80 p-6 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l"
            style={{
                borderColor: 'var(--color-gray-light)',
                background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
            }}
            role="region"
            aria-label="Upcoming Events"
        >
          <h3 
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" 
            style={{ color: 'var(--color-gray)' }}
          >
            Upcoming Events
          </h3>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>Loading events...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(ev => <UpcomingEventRow key={ev._id} event={ev} isDark={isDark} isFavorite={isFavorite(ev._id)} onToggleFavorite={() => toggleFavorite(ev._id)}/>)}
            </div>
          )}
        </div>
      </div>

      {/* Submission Note for User Submitted Events */}
      {/* reymes end - calendar surface readability in dark mode */}
      <div
        className="px-6 py-4 text-center"
        style={{
          borderTop: '1px solid var(--color-gray-light)',
          background: isDark ? 'rgba(255,255,255,0.01)' : 'var(--color-gray-light)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
          Want to see your event featured?{' '}
          <Link
            href="/SubmitEventForm"
            className="font-semibold hover:underline transition-all"
            style={{ color: 'var(--color-cyan)' }}
          >
            Submit an event
          </Link>
          .
        </p>
      </div>
      {/* ===== End of added code ===== */}
    </div>
  );
}

// Full event card shown when a day is clicked
function EventCard({ event, isDark, isFavorite, onToggleFavorite }: { event: CalendarEvent; isDark: boolean, isFavorite: boolean, onToggleFavorite: () => void }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG['Campaign'];
  const accent = isDark ? cfg.darkColor : cfg.color;
  return (
    <div
      className="rounded-xl p-4 transition-all hover:shadow-md"
      style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : cfg.bg,
        border: `1.5px solid ${accent}`,
      }}
      role="article"
    >
      {/* reymes start - event card dark-mode readability */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: accent, color: isDark ? '#0a0a0a' : 'white' }}
        >
          {event.type}
        </span>
        <div>
          {event.verified && (
            <div 
              className="flex items-center gap-1 text-xs font-medium" 
              style={{ color: '#00A852' }}
              title="Verified event"
            >
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              Verified
            </div>
          )}
          {/* added daniel q. 4/25/26 start */}
          <button
            onClick={onToggleFavorite}
            className="p-1 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{ 
              color: isFavorite ? '#FFD700' : 'var(--color-gray)',
              fontSize: '1.25rem'
            }}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        {/* added daniel q. 4/25/26 end */}
      </div>
      <p 
        className="text-sm font-bold mb-2" 
        style={{ color: 'var(--foreground)' }}
      >
        {event.title}
      </p>
      <p 
        className="text-xs leading-relaxed mb-3" 
        style={{ color: 'var(--color-gray-dark)' }}
      >
        {event.description}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--color-gray)' }}>
          Location: {event.location}
        </span>
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
            style={{ color: accent }}
            aria-label={`Learn more about ${event.title}`}
          >
            {event.sourceLabel || 'Learn more'}
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </div>
      {/* reymes end - event card dark-mode readability */}
    </div>
  );
}

// Compact row used in the upcoming sidebar
function UpcomingEventRow({ event, isDark, isFavorite, onToggleFavorite }: { event: CalendarEvent; isDark: boolean; isFavorite: boolean; onToggleFavorite: () => void }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG['Campaign'];
  const accent = isDark ? cfg.darkColor : cfg.color;
  const d = new Date(event.date);
  const day = d.getDate();
  const mon = MONTHS[d.getMonth()].slice(0, 3);

  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-opacity-70"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : cfg.bg,
        border: `1px solid ${accent}66`,
      }}
      role="article"
    >
      {/* reymes start - upcoming row dark-mode readability */}
      {/* Date badge */}
      {/* reymes start - date badge readability */}
      <div
        className="flex-shrink-0 w-12 rounded-lg flex flex-col items-center justify-center py-2"
        style={{ background: isDark ? 'rgba(0,0,0,0.2)' : cfg.bg }}
      >
        <span className="text-xs font-bold leading-none text-center" style={{ color: accent }}>{mon}</span>
        <span className="text-lg font-black leading-none mt-1" style={{ color: accent }}>{day}</span>
      </div>
      {/* reymes end - date badge readability */}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5 mb-1">
          <p 
            className="text-xs font-bold truncate" 
            style={{ color: 'var(--foreground)' }}
          >
            {event.title}
          </p>
          {event.verified && <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#00A852' }} aria-label="Verified" />}
          {/* added daniel q. 4/25/26 start */}
          <button
            onClick={onToggleFavorite}
            className="flex-shrink-0 p-0.5 rounded transition-all hover:scale-110 ml-auto"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{ 
              color: isFavorite ? '#FFD700' : 'var(--color-gray)',
              fontSize: '0.875rem'
            }}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          {/* added daniel q. 4/25/26 end */}
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)', color: accent }}
        >
          {cfg.label}
        </span>
      </div>
      {/* reymes end - upcoming row dark-mode readability */}
    </div>
  );
}
// End of Creation by Christella - 04/13/2026
