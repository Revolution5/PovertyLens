
// Created by Marisol Morales for work review 3
// New InboxDrawer component for quick access to recent messages without leaving current page

'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, MailOpen, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Message, MessageType } from '@/lib/messageTemplates';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Badge color per message type
function getTypeBadge(type: MessageType): { label: string; color: string; bg: string } {
  switch (type) {
    case 'story_under_review':   return { label: 'Under Review', color: '#FFA239', bg: 'rgba(255,162,57,0.12)' };
    case 'story_approved':       return { label: 'Approved',     color: '#8CE4FF', bg: 'rgba(140,228,255,0.12)' };
    case 'story_report_cleared': return { label: 'Cleared',      color: '#8CE4FF', bg: 'rgba(140,228,255,0.12)' };
    case 'story_removed':        return { label: 'Removed',      color: '#FF5656', bg: 'rgba(255,86,86,0.12)' };
    case 'warning_issued':       return { label: 'Warning',      color: '#F5D547', bg: 'rgba(245,213,71,0.12)' };
    case 'suspension_issued':    return { label: 'Suspended',    color: '#FF5656', bg: 'rgba(255,86,86,0.12)' };
    case 'ban_issued':           return { label: 'Banned',       color: '#FF5656', bg: 'rgba(255,86,86,0.12)' };
  }
}

export function InboxDrawer({ isOpen, onClose }: InboxDrawerProps) {
  const { theme, contrast } = useTheme();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);

  // Track whether we're mounted on the client so createPortal is safe to call
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Button uses hardcoded orange so it's always visible on both light and dark
  // drawer backgrounds, regardless of theme or any CSS variable overrides.
  // The .inbox-filter-exempt class on the footer div tells globals.css to skip
  // the colorblind body filter for this element.
  const viewAllStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.875rem',
    textDecoration: 'none',
    backgroundColor: '#FFA239',
    color: '#000000',
    border: '2px solid #FFA239',
    cursor: 'pointer',
  };

  const unread = messages.filter(m => !m.read).length;

  const handleMessageClick = async (msg: Message) => {
    if (!msg.read) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      try {
        await fetch(`${BACKEND_URL}/api/messages/${msg.id}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
        window.dispatchEvent(new Event('inboxUpdated'));
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setMessages([]);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/messages?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load messages');
        }
        setMessages(Array.isArray(data.messages) ? data.messages.slice(0, 5) : []);
      } catch (err) {
        console.error('Error loading inbox drawer messages:', err);
        setMessages([]);
      }
    };

    loadMessages();
    window.addEventListener('inboxUpdated', loadMessages);
    return () => window.removeEventListener('inboxUpdated', loadMessages);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-[999] flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: '420px',
          maxWidth: '100vw',
          backgroundColor: 'var(--background)',
          borderLeft: '1px solid var(--color-gray-light)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: isOpen ? '-8px 0 32px rgba(0,0,0,0.15)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-gray-light)' }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Inbox</h2>
              {unread > 0 && (
                <p className="text-xs" style={{ color: 'var(--color-gray)' }}>{unread} unread message{unread !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-gray)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message list — minHeight: 0 is critical so this flex child scrolls
            instead of growing past the container and pushing the footer off-screen */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
              <MailOpen className="w-12 h-12" style={{ color: 'var(--color-gray-light)' }} />
              <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No messages yet</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const badge = getTypeBadge(msg.type);
              return (
                <div
                  key={msg.id}
                  className="px-6 py-4 cursor-pointer transition-colors"
                  onClick={() => handleMessageClick(msg)}
                  style={{
                    borderBottom: i < messages.length - 1 ? '1px solid var(--color-gray-light)' : 'none',
                    backgroundColor: msg.read ? 'transparent' : (isDark ? 'rgba(140,228,255,0.04)' : 'rgba(140,228,255,0.06)'),
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = msg.read ? 'transparent' : (isDark ? 'rgba(140,228,255,0.04)' : 'rgba(140,228,255,0.06)')}
                >
                  <div className="flex items-start gap-3">
                    {/* Read/unread icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {msg.read
                        ? <MailOpen className="w-4 h-4" style={{ color: 'var(--color-gray)' }} />
                        : <Mail className="w-4 h-4" style={{ color: '#8CE4FF' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-[#8CE4FF] flex-shrink-0" />
                        )}
                      </div>
                      <p
                        className="text-sm font-medium mb-1 truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {msg.subject}
                      </p>
                      <p
                        className="text-xs line-clamp-2 mb-2"
                        style={{ color: 'var(--color-gray)' }}
                      >
                        {msg.body}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                        {msg.from} · {msg.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer - inbox-filter-exempt tells globals.css to skip the colorblind
            body filter for this element so the button colors are never distorted */}
        <div
          className="px-6 py-4 flex-shrink-0 inbox-filter-exempt"
          style={{ borderTop: '1px solid var(--color-gray-light)' }}
        >
          <a href="/inbox" onClick={onClose} style={viewAllStyle}>
            View All Messages
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>,
    document.documentElement
  );
}