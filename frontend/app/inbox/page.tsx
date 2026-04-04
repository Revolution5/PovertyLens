// Created by Marisol Morales for work review 3
'use client';

import React, { useState } from 'react'; // Removed useEffect - no longer needed for dark mode
import { Mail, MailOpen, Search, Archive, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider'; 
import { mockMessages, Message, MessageType } from '@/lib/messageTemplates'; 

function getTypeBadge(type: MessageType): { label: string; color: string; bg: string; icon: any } {
  switch (type) {
    case 'story_under_review':
      return { label: 'Under Review', color: '#FFA239', bg: 'rgba(255,162,57,0.15)', icon: Clock };
    case 'story_approved':
      return { label: 'Approved', color: '#8CE4FF', bg: 'rgba(140,228,255,0.15)', icon: CheckCircle2 };
    case 'story_report_cleared':
      return { label: 'Cleared', color: '#8CE4FF', bg: 'rgba(140,228,255,0.15)', icon: CheckCircle2 };
    case 'story_removed':
      return { label: 'Removed', color: '#FF5656', bg: 'rgba(255,86,86,0.15)', icon: Trash2 };
    case 'warning_issued':
      return { label: 'Warning', color: '#F5D547', bg: 'rgba(245,213,71,0.15)', icon: Clock };
    case 'suspension_issued':
      return { label: 'Suspended', color: '#FF5656', bg: 'rgba(255,86,86,0.15)', icon: Archive };
    case 'ban_issued':
      return { label: 'Banned', color: '#FF5656', bg: 'rgba(255,86,86,0.15)', icon: Archive };
  }
}

export default function EnhancedInbox() {
  const { theme } = useTheme(); 
  const isDark = theme === 'dark';
  const [selected, setSelected] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unread = messages.filter(m => !m.read).length;

  const handleSelect = (msg: Message) => {
    setSelected(msg);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
  };

  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'unread' && !msg.read);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Inbox
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-gray)' }}>
                {unread > 0 ? `${unread} unread message${unread !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                style={{
                  background: '#FFA239 100%',
                  color: 'white'
                }}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: 'var(--color-gray)' }}
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                border: '1px solid var(--color-gray-light)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div 
            className="flex rounded-xl p-1"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
              border: '1px solid var(--color-gray-light)'
            }}
          >
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: filter === 'all' ? (isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.3)') : 'transparent',
                color: filter === 'all' ? '#8CE4FF' : 'var(--color-gray)'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className="px-6 py-2 rounded-lg text-sm font-medium transition-all relative"
              style={{
                backgroundColor: filter === 'unread' ? (isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.3)') : 'transparent',
                color: filter === 'unread' ? '#8CE4FF' : 'var(--color-gray)'
              }}
            >
              Unread
              {unread > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                  style={{ backgroundColor: '#FF5656', color: 'white' }}
                >
                  {unread}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="rounded-2xl overflow-hidden shadow-lg flex flex-col lg:flex-row"
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--color-gray-light)',
            minHeight: '600px',
          }}
        >
          {/* Message List */}
          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRight: '1px solid var(--color-gray-light)',
            }}
          >
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(140, 228, 255, 0.1)' }}
                >
                  <MailOpen className="w-10 h-10" style={{ color: '#8CE4FF' }} />
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                    No messages found
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    {searchQuery ? 'Try a different search' : 'Your inbox is empty'}
                  </p>
                </div>
              </div>
            ) : (
              filteredMessages.map((msg, i) => {
                const badge = getTypeBadge(msg.type);
                const isActive = selected?.id === msg.id;
                const BadgeIcon = badge.icon;
                
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className="px-6 py-5 cursor-pointer transition-all duration-200 relative"
                    style={{
                      borderBottom: i < filteredMessages.length - 1 ? '1px solid var(--color-gray-light)' : 'none',
                      backgroundColor: isActive
                        ? (isDark ? 'rgba(140,228,255,0.1)' : 'rgba(140,228,255,0.15)')
                        : 'transparent',
                      borderLeft: isActive ? '4px solid #8CE4FF' : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Unread indicator */}
                    {!msg.read && (
                      <div 
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#8CE4FF' }}
                      />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div 
                        className="mt-1 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: badge.bg }}
                      >
                        {msg.read ? (
                          <MailOpen className="w-5 h-5" style={{ color: badge.color }} />
                        ) : (
                          <Mail className="w-5 h-5" style={{ color: badge.color }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>
                        <p 
                          className={`text-sm mb-1 line-clamp-2 ${!msg.read ? 'font-semibold' : 'font-medium'}`}
                          style={{ color: 'var(--foreground)' }}
                        >
                          {msg.subject}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                          {msg.date}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-1 p-8 overflow-y-auto">
            {selected ? (
              <div className="max-w-3xl">
                {/* Badge */}
                <div className="mb-6">
                  {(() => {
                    const badge = getTypeBadge(selected.type);
                    const BadgeIcon = badge.icon;
                    return (
                      <span
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        <BadgeIcon className="w-4 h-4" />
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Subject */}
                <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  {selected.subject}
                </h2>

                {/* Meta info */}
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '2px solid var(--color-gray-light)' }}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ 
                        background: 'linear-gradient(135deg, #8CE4FF 0%, #FFA239 100%)',
                        color: 'white'
                      }}
                    >
                      PL
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {selected.from}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                        {selected.date}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--color-gray-dark)' }}
                >
                  {selected.body}
                </div>

                </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(140, 228, 255, 0.1)' }}
                >
                  <MailOpen className="w-12 h-12" style={{ color: '#8CE4FF' }} />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                    Select a message
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
                    Choose a message from the list to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}