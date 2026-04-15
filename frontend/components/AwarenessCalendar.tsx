// Created by Christella - 04/13/2026
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

const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'Awareness Day': { color: '#8CE4FF', bg: 'rgba(140,228,255,0.15)' },
  'Volunteering':  { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)'   },
  'Fundraiser':    { color: '#FFA239', bg: 'rgba(255,162,57,0.15)'   },
  'Conference':    { color: '#B388FF', bg: 'rgba(179,136,255,0.15)'  },
  'Campaign':      { color: '#FF5656', bg: 'rgba(255,86,86,0.15)'    },
};

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

  // Upcoming events across all months — next 5
  const upcoming = [...events]
    .filter(ev => new Date(ev.date) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
        border: '1px solid var(--color-gray-light)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--color-gray-light)',
          background: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: 'var(--color-orange)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Awareness Calendar
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : '#f0f0f0',
              color: 'var(--foreground)',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold w-32 text-center" style={{ color: 'var(--foreground)' }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.07)' : '#f0f0f0',
              color: 'var(--foreground)',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    <div className="flex flex-col lg:flex-row">

        {/* Calendar grid */}
        <div className="flex-1 p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div
                key={d}
                className="text-center text-xs font-semibold py-1"
                style={{ color: 'var(--color-gray)' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasEvents = !!eventsByDay[day];
              const isSelected = selectedDay === day;
              const isTodayDay = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className="relative flex flex-col items-center justify-start rounded-xl py-1.5 px-1 transition-all"
                  style={{
                    minHeight: 44,
                    background: isSelected
                      ? 'var(--gradient-orange-red)'
                      : isTodayDay
                      ? (isDark ? 'rgba(255,162,57,0.15)' : 'rgba(255,162,57,0.1)')
                      : hasEvents
                      ? (isDark ? 'rgba(255,255,255,0.04)' : '#f7f7f7')
                      : 'transparent',
                    border: isTodayDay && !isSelected
                      ? '1.5px solid var(--color-orange)'
                      : '1.5px solid transparent',
                    cursor: hasEvents ? 'pointer' : 'default',
                  }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: isSelected ? 'white' : isTodayDay ? 'var(--color-orange)' : 'var(--foreground)',
                    }}
                  >
                    {day}
                  </span>

                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {eventsByDay[day].slice(0, 3).map((ev, idx) => {
                        const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG['Campaign'];
                        return (
                          <div
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: isSelected ? 'white' : cfg.color }}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>
                {MONTHS[month]} {selectedDay}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No events this day.</p>
              ) : (
                selectedEvents.map(ev => <EventCard key={ev._id} event={ev} isDark={isDark} />)
              )}
            </div>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div
            className="lg:w-72 p-4 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l"
            style={{
                borderColor: 'var(--color-gray-light)',
            }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>
            Upcoming Events
          </p>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No upcoming events.</p>
          ) : (
            upcoming.map(ev => <UpcomingEventRow key={ev._id} event={ev} isDark={isDark} />)
          )}
        </div>
      </div>

      {/* Submission Note for User Submitted Events */}
      <div
        className="px-6 py-4 text-center"
        style={{
          borderTop: '1px solid var(--color-gray-light)',
          background: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
          Want to see your event featured?{' '}
          <Link
            href="/SubmitEventForm"
            className="font-semibold hover:underline transition-all"
            style={{ color: 'var(--color-orange)' }}
          >
            Click here
          </Link>{' '}
          to submit an event.
        </p>
      </div>
      {/* ===== End of added code ===== */}
    </div>
  );
}

// Full event card shown when a day is clicked
function EventCard({ event, isDark }: { event: CalendarEvent; isDark: boolean }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG['Campaign'];
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : cfg.bg,
        border: `1px solid ${cfg.color}40`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {event.type}
        </span>
        {event.verified && (
          <div className="flex items-center gap-1 text-xs" style={{ color: '#4CAF50' }}>
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{event.title}</p>
      <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--color-gray)' }}>{event.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--color-gray)' }}>{event.location}</span>
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: cfg.color }}
          >
            <ExternalLink className="w-3 h-3" />
            {event.sourceLabel || 'Learn more'}
          </a>
        )}
      </div>
    </div>
  );
}

// Compact row used in the upcoming sidebar
function UpcomingEventRow({ event, isDark }: { event: CalendarEvent; isDark: boolean }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG['Campaign'];
  const d = new Date(event.date);
  const day = d.getDate();
  const mon = MONTHS[d.getMonth()].slice(0, 3);

  return (
    <div className="flex items-start gap-3">
      {/* Date badge */}
      <div
        className="flex-shrink-0 w-10 rounded-lg flex flex-col items-center justify-center py-1"
        style={{ background: cfg.bg }}
      >
        <span className="text-xs font-bold leading-none" style={{ color: cfg.color }}>{mon}</span>
        <span className="text-sm font-black leading-none mt-0.5" style={{ color: cfg.color }}>{day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {event.title}
          </p>
          {event.verified && <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#4CAF50' }} />}
        </div>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {event.type}
        </span>
      </div>
    </div>
  );
}
// End of Creation by Christella - 04/13/2026