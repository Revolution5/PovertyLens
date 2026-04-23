// PovertyLens Admin Dashboard
// Created by Marisol Morales for Work Review 3

"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Users, Heart, FileText, Gamepad2, ArrowUpRight, ArrowDownRight, Search, ShieldOff, ShieldBan } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface StoryReport {
  _id: string;
  reason: string;
  reportedBy?: string | null;
  status: 'open' | 'ignored';
  createdAt?: string;
}

// START Added by Marisol for Work Review 3 - Contact form submission type
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied';
  reply?: string | null;
  repliedAt?: string | null;
  repliedBy?: string | null;
  createdAt?: string;
}
// END Added by Marisol for Work Review 3

// START Added by Damon - 04/03/2026 - Type for reported stories
interface ReportedStory {
  _id: string;
  title?: string;
  storyText?: string;
  country?: string | null;
  userEmail?: string | null;
  createdAt?: string;
  reports?: StoryReport[];
}
// END Added by Damon - 04/03/2026 - Type for reported stories

interface ManagedUser {
  _id: string;
  email: string;
  username: string;
  createdAt?: string;
  suspended?: boolean;
  banned?: boolean;
  admin?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  storiesShared: number;
  riceDonated: number;
  donationsMade: number;
  usersChange: string;
  storiesChange: string;
  riceChange: string;
  donationsChange: string;
}

interface UserGrowthPoint { month: string; users: number; stories: number; }
interface DonationPoint { month: string; amount: number; }
interface RicePoint { period: string; grains: number; players: number; }

// Addition by Christella - 04/14/2026 - Awareness Calendar Interfaces for Event Approval
interface PendingEvent{
  _id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  location?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  submittedBy?: string;
  submittedEmail?: string;
  createdAt?: string;
}
// End of addition by Christella - 04/14/2026

// ============== Stat Card ==============
interface StatCardProps {
  title: string; value: string; change: string;
  trend: 'up' | 'down' | 'neutral'; icon: any; color: string;
}

function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-xl p-6 transition-all duration-200"
      style={{
        backgroundColor: 'var(--background)',
        border: `1px solid ${hovered ? color + '60' : 'var(--color-gray-light)'}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 24px ${color}20` : 'var(--shadow-sm)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: trend === 'up' ? 'rgba(34,197,94,0.1)' : trend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(156,163,175,0.15)',
            color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#9ca3af',
          }}
        >
          {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
          {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--color-gray)' }}>{title}</p>
      <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  );
}

// ============== Chart Card ==============
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-gray-light)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>{title}</h3>
      {children}
    </div>
  );
}

// ============== Admin Dashboard Page ==============
export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // START Added by Marisol for Work Review 3 - added 'contacts' to tab union
  const [adminTab, setAdminTab] = useState<'analytics' | 'reports' | 'users' | 'contacts' | 'events'>('analytics'); // Edited by Christella - 04/14/2026 - for Awareness Calendar Event Approval
  // END Added by Marisol for Work Review 3

  // Reports state
  const [reportedStoriesLoading, setReportedStoriesLoading] = useState(false);
  const [reportedStoriesError, setReportedStoriesError] = useState('');
  const [reportedStories, setReportedStories] = useState<ReportedStory[]>([]);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, storiesShared: 0, riceDonated: 0, donationsMade: 0,
    usersChange: '+0%', storiesChange: '+0%', riceChange: '+0%', donationsChange: '+0%',
  });
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthPoint[]>([]);
  const [donationData, setDonationData] = useState<DonationPoint[]>([]);
  const [riceData, setRiceData] = useState<RicePoint[]>([]);
  const [riceRange, setRiceRange] = useState<'7d' | '4w' | '4m'>('4w');

  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const currentAdminEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';

  // START Added by Marisol for Work Review 3 - Contact forms state (moved inside component)
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  // END Added by Marisol for Work Review 3
  
  // Addition by Christella - 04/14/2026 - Awareness Calendar Constants
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [eventReviewNotes, setEventReviewNotes] = useState<Record<string, string>>({});
  const [eventStatusView, setEventStatusView] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [approvedEvents, setApprovedEvents] = useState<PendingEvent[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<PendingEvent[]>([]);
  const visibleEvents =
  eventStatusView === 'pending'
    ? pendingEvents
    : eventStatusView === 'approved'
    ? approvedEvents
    : rejectedEvents;
  // End of Addition by Christella - 04/14/2026

  const getTrendFromChange = (change: string): 'up' | 'down' | 'neutral' => {
    const value = parseFloat(change.replace('%', ''));
    if (isNaN(value)) return 'neutral';
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axisColor = isDark ? 'var(--color-gray)' : '#888';
  const tooltipStyle = {
    backgroundColor: 'var(--background)',
    border: '1px solid var(--color-gray-light)',
    borderRadius: '8px',
    color: 'var(--foreground)',
  };

  const fetchAnalytics = useCallback(async (selectedRange?: '7d' | '4w' | '4m') => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const rangeToUse = selectedRange || riceRange;
      const res = await fetch(`${BACKEND_URL}/api/admin/analytics?range=${rangeToUse}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load analytics');
      setStats(data.stats || { totalUsers: 0, storiesShared: 0, riceDonated: 0, donationsMade: 0, usersChange: '+0%', storiesChange: '+0%', riceChange: '+0%', donationsChange: '+0%' });
      setUserGrowthData(Array.isArray(data.userGrowthData) ? data.userGrowthData : []);
      setDonationData(Array.isArray(data.donationData) ? data.donationData : []);
      setRiceData(Array.isArray(data.riceData) ? data.riceData : []);
    } catch (err: any) {
      setAnalyticsError(err?.message || 'Failed to load analytics');
      setUserGrowthData([]); setDonationData([]); setRiceData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [riceRange]);

  useEffect(() => { fetchAnalytics(riceRange); }, [fetchAnalytics, riceRange]);

  const fetchReportedStories = useCallback(async () => {
    setReportedStoriesLoading(true);
    setReportedStoriesError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/stories/reported?status=open`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load reported stories');
      setReportedStories(Array.isArray(data.stories) ? data.stories : []);
    } catch (err: any) {
      setReportedStories([]);
      setReportedStoriesError(err?.message || 'Failed to load reported stories');
    } finally {
      setReportedStoriesLoading(false);
    }
  }, []);

  const handleIgnoreReport = useCallback(async (storyId: string, reportId: string) => {
    const key = `ignore-${storyId}-${reportId}`;
    setActionLoadingKey(key);
    try {
      const reviewedBy = localStorage.getItem('userEmail');
      const res = await fetch(`${BACKEND_URL}/api/stories/${storyId}/report/${reportId}/ignore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: reviewedBy || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to ignore report');
      await fetchReportedStories();
    } catch (err: any) {
      setReportedStoriesError(err?.message || 'Failed to ignore report');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchReportedStories]);

  const handleDeleteStory = useCallback(async (storyId: string) => {
    if (!window.confirm('Delete this story? This action cannot be undone.')) return;
    const key = `delete-${storyId}`;
    setActionLoadingKey(key);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const res = await fetch(`${BACKEND_URL}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: userEmail || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete story');
      await fetchReportedStories();
    } catch (err: any) {
      setReportedStoriesError(err?.message || 'Failed to delete story');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchReportedStories]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load users');
      setUsersList(Array.isArray(data.users) ? data.users : []);
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to load users');
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleSuspend = useCallback(async (email: string, suspend: boolean) => {
    setActionLoadingKey(`suspend-${email}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, suspend }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update');
      await fetchUsers();
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to update user');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchUsers]);

  const handleBan = useCallback(async (email: string, ban: boolean) => {
    if (ban && !window.confirm(`Permanently ban ${email}? They will not be able to log in.`)) return;
    setActionLoadingKey(`ban-${email}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ban }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update');
      await fetchUsers();
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to update user');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchUsers]);

  const filteredUsers = usersList.filter((u) => {
    const q = usersSearch.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
  });

  // START Added by Marisol for Work Review 3 - fetch contact form submissions
  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    setContactsError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
      setContacts(Array.isArray(data.contacts) ? data.contacts : []);
    } catch (err: any) {
      setContactsError(err?.message || 'Failed to load contact forms');
    } finally {
      setContactsLoading(false);
    }
  }, []);

  // START Added by Marisol for Work Review 3 - send reply to contact form submission
  const handleReply = useCallback(async (contactId: string) => {
    const reply = replyText[contactId]?.trim();
    if (!reply) return;
    setReplyLoading(contactId);
    try {
      const adminEmail = localStorage.getItem('userEmail');
      const res = await fetch(`${BACKEND_URL}/api/contact/${contactId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply, adminEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send reply');
      setReplyText((prev) => ({ ...prev, [contactId]: '' }));
      await fetchContacts();
    } catch (err: any) {
      setContactsError(err?.message || 'Failed to send reply');
    } finally {
      setReplyLoading(null);
    }
  }, [replyText, fetchContacts]);
  // END Added by Marisol for Work Review 3

  // Addition by Christella - 04/14/2026 for Awareness Calendar Events
  const fetchPendingEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/pending`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load pending events');
      setPendingEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to load pending events');
      setPendingEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const handleApproveEvent = useCallback(async (eventId: string) => {
    setActionLoadingKey(`approve-event-${eventId}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to approve event');
      await fetchPendingEvents();
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to approve event');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchPendingEvents]);

  const handleRejectEvent = useCallback(async (eventId: string) => {
    setActionLoadingKey(`reject-event-${eventId}`);
    try {
      const reason = eventReviewNotes[eventId]?.trim() || '';
      const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reject event');
      setEventReviewNotes(prev => ({ ...prev, [eventId]: '' }));
      await fetchPendingEvents();
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to reject event');
    } finally {
      setActionLoadingKey(null);
    }
  }, [eventReviewNotes, fetchPendingEvents]);

  const fetchApprovedEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/approved`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load approved events');
      setApprovedEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to load approved events');
      setApprovedEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchRejectedEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/rejected`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load denied events');
      setRejectedEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to load denied events');
      setRejectedEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const handleResetEvent = useCallback(async (eventId: string) => {
    setActionLoadingKey(`reset-event-${eventId}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/${eventId}/reset`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reset event');

      if (eventStatusView === 'approved') await fetchApprovedEvents();
      if (eventStatusView === 'rejected') await fetchRejectedEvents();
      await fetchPendingEvents();
    } catch (err: any) {
      setEventsError(err?.message || 'Failed to reset event');
    } finally {
      setActionLoadingKey(null);
    }
  }, [eventStatusView, fetchApprovedEvents, fetchRejectedEvents, fetchPendingEvents]);
  // End of Addition by Christella - 04/14/2026

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              Admin Dashboard
            </h1>
            <p className="text-base" style={{ color: 'var(--color-gray)' }}>
              Monitor PovertyLens platform impact and engagement
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap"> {/*Modified by Christella - 04/14/2026*/}
            <button
              type="button"
              onClick={() => setAdminTab('analytics')}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: adminTab === 'analytics' ? '#8CE4FF' : 'rgba(140,228,255,0.1)',
                border: '1px solid rgba(140,228,255,0.3)',
                color: adminTab === 'analytics' ? '#111' : '#8CE4FF',
              }}
            >
              Analytics
            </button>

            {/* START Added by Damon - 04/03/2026 - Reported Stories button */}
            <button
              type="button"
              onClick={async () => { setAdminTab('reports'); await fetchReportedStories(); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: adminTab === 'reports' ? '#FFA239' : 'rgba(255,162,57,0.1)',
                border: '1px solid rgba(255,162,57,0.3)',
                color: adminTab === 'reports' ? '#111' : '#FFA239',
              }}
            >
              Reported Stories
            </button>
            {/* END Added by Damon - 04/03/2026 */}

            <button
              type="button"
              onClick={async () => { setAdminTab('users'); await fetchUsers(); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: adminTab === 'users' ? '#FF5656' : 'rgba(255,86,86,0.1)',
                border: '1px solid rgba(255,86,86,0.3)',
                color: adminTab === 'users' ? '#fff' : '#FF5656',
              }}
            >
              User Management
            </button>

            {/* START Added by Marisol for Work Review 3 - Contact Forms tab button */}
            <button
              type="button"
              onClick={async () => { setAdminTab('contacts'); await fetchContacts(); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: adminTab === 'contacts' ? '#22c55e' : 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: adminTab === 'contacts' ? '#fff' : '#22c55e',
              }}
            >
              Contact Forms
            </button>
            {/* END Added by Marisol for Work Review 3 */}

            {/*Addition by Christella - 04/14/2026 - Tab Button for Events Pending Approval */}
            <button
              type="button"
              onClick={async () => { setAdminTab('events'); await fetchPendingEvents(); }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: adminTab === 'events' ? '#B388FF' : 'rgba(179,136,255,0.1)',
                border: '1px solid rgba(179,136,255,0.3)',
                color: adminTab === 'events' ? '#111' : '#B388FF',
              }}
            >
              Event Reviews
            </button>
            {/*End of Addition by Christella - 04/14/2026 */}
          </div>
        </div>

        {/* ── Reports Tab ── */}
        {adminTab === 'reports' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-gray-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Reported Stories</h2>
            {reportedStoriesLoading && <p style={{ color: 'var(--color-gray)' }}>Loading reported stories...</p>}
            {reportedStoriesError && <p className="text-sm text-red-600 mb-3">{reportedStoriesError}</p>}
            {!reportedStoriesLoading && !reportedStoriesError && reportedStories.length === 0 && (
              <p style={{ color: 'var(--color-gray)' }}>No open reports right now.</p>
            )}
            <div className="space-y-4">
              {reportedStories.map((story) => {
                const openReports = Array.isArray(story.reports) ? story.reports.filter((r) => r.status === 'open') : [];
                return (
                  <div key={story._id} className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fbfbfb' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{story.title?.trim() ? story.title : 'Untitled Story'}</h3>
                        <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                          {story.country ? `Country: ${story.country}` : 'Country: N/A'}
                          {story.createdAt ? ` • Created: ${new Date(story.createdAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                      {(story.storyText || '').slice(0, 250)}{(story.storyText || '').length > 250 ? '...' : ''}
                    </p>
                    <div className="space-y-2">
                      {openReports.map((report) => {
                        const key = `ignore-${story._id}-${report._id}`;
                        return (
                          <div key={report._id} className="rounded-md p-3" style={{ border: '1px solid var(--color-gray-light)', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff' }}>
                            <p className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>{report.reason}</p>
                            <p className="text-xs mb-2" style={{ color: 'var(--color-gray)' }}>
                              {report.reportedBy ? `Reported by: ${report.reportedBy}` : 'Reported by: Anonymous'}
                              {report.createdAt ? ` • ${new Date(report.createdAt).toLocaleString()}` : ''}
                            </p>
                            <div className="flex items-center gap-2">
                              <button type="button" disabled={actionLoadingKey === key} onClick={() => handleIgnoreReport(story._id, report._id)}
                                className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
                                style={{ border: '1px solid var(--color-gray-light)', color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>
                                {actionLoadingKey === key ? 'Ignoring...' : 'Ignore Report'}
                              </button>
                              <button type="button" disabled={actionLoadingKey === `delete-${story._id}`} onClick={() => handleDeleteStory(story._id)}
                                className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
                                style={{ backgroundColor: '#FF5656', color: '#fff' }}>
                                {actionLoadingKey === `delete-${story._id}` ? 'Deleting...' : 'Delete Story'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* START Added by Marisol for work review 3 - User Management Tab */}
        {adminTab === 'users' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-gray-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-gray)' }} />
                <input
                  type="text"
                  placeholder="Search by email or username..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8CE4FF]"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--color-gray-light)', color: 'var(--foreground)', width: '260px' }}
                />
              </div>
            </div>

            {usersLoading && <p style={{ color: 'var(--color-gray)' }}>Loading users...</p>}
            {usersError && <p className="text-sm text-red-500 mb-3">{usersError}</p>}
            {!usersLoading && filteredUsers.length === 0 && <p style={{ color: 'var(--color-gray)' }}>No users found.</p>}

            <div className="space-y-3">
              {filteredUsers.map((u) => {
                const isSelf = u.email === currentAdminEmail;
                return (
                  <div key={u._id} className="rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
                    style={{ border: '1px solid var(--color-gray-light)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fbfbfb' }}>

                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #FFA239, #FF5656)', color: '#fff' }}>
                        {(u.username || u.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>@{u.username || '—'}</span>
                          {u.admin && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(140,228,255,0.15)', color: '#8CE4FF' }}>Admin</span>}
                          {u.banned && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(255,86,86,0.15)', color: '#FF5656' }}>Banned</span>}
                          {u.suspended && !u.banned && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(255,162,57,0.15)', color: '#FFA239' }}>Suspended</span>}
                          {isSelf && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>You</span>}
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--color-gray)' }}>
                          {u.email}{u.createdAt ? ` • Joined ${new Date(u.createdAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons — hidden for self and other admins */}
                    {!isSelf && !u.admin ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button"
                          disabled={!!actionLoadingKey || u.banned}
                          onClick={() => handleSuspend(u.email, !u.suspended)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: u.suspended ? 'rgba(34,197,94,0.1)' : 'rgba(255,162,57,0.1)',
                            border: `1px solid ${u.suspended ? 'rgba(34,197,94,0.3)' : 'rgba(255,162,57,0.3)'}`,
                            color: u.suspended ? '#22c55e' : '#FFA239',
                          }}>
                          <ShieldOff className="w-3.5 h-3.5" />
                          {actionLoadingKey === `suspend-${u.email}` ? '...' : u.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button type="button"
                          disabled={!!actionLoadingKey}
                          onClick={() => handleBan(u.email, !u.banned)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: u.banned ? 'rgba(34,197,94,0.1)' : 'rgba(255,86,86,0.1)',
                            border: `1px solid ${u.banned ? 'rgba(34,197,94,0.3)' : 'rgba(255,86,86,0.3)'}`,
                            color: u.banned ? '#22c55e' : '#FF5656',
                          }}>
                          <ShieldBan className="w-3.5 h-3.5" />
                          {actionLoadingKey === `ban-${u.email}` ? '...' : u.banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs flex-shrink-0" style={{ color: 'var(--color-gray)' }}>
                        {isSelf ? 'Cannot modify your own account' : 'Cannot modify admin accounts'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* END Added by Marisol for work review 3 */}

        {/* START Added by Marisol for Work Review 3 - Contact Forms Tab */}
        {adminTab === 'contacts' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-gray-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Contact Form Submissions</h2>
            {contactsLoading && <p style={{ color: 'var(--color-gray)' }}>Loading...</p>}
            {contactsError && <p className="text-sm text-red-500 mb-3">{contactsError}</p>}
            {!contactsLoading && contacts.length === 0 && (
              <p style={{ color: 'var(--color-gray)' }}>No submissions yet.</p>
            )}
            <div className="space-y-4">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-lg p-4" style={{ border: '1px solid var(--color-gray-light)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fbfbfb' }}>
                  {/* Submission header - name, email, status badge */}
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--color-gray)' }}>{c.email}</span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor: c.status === 'replied' ? 'rgba(34,197,94,0.1)' : 'rgba(255,162,57,0.1)',
                        color: c.status === 'replied' ? '#22c55e' : '#FFA239',
                      }}
                    >
                      {c.status === 'replied' ? 'Replied' : 'Pending'}
                    </span>
                  </div>

                  {/* Subject and message body */}
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-gray)' }}>Subject: {c.subject}</p>
                  <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{c.message}</p>

                  {/* Show existing reply if already replied */}
                  {c.status === 'replied' && c.reply && (
                    <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>Your reply:</p>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>{c.reply}</p>
                    </div>
                  )}

                  {/* Reply textarea + send button — only shown for pending submissions */}
                  {c.status === 'pending' && (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Type your reply..."
                        value={replyText[c.id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid var(--color-gray-light)', color: 'var(--foreground)' }}
                      />
                      <button
                        type="button"
                        disabled={!replyText[c.id]?.trim() || replyLoading === c.id}
                        onClick={() => handleReply(c.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#22c55e', color: '#fff' }}
                      >
                        {replyLoading === c.id ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* END Added by Marisol for Work Review 3 */}

        {/* ── Analytics Tab ── */}
        {adminTab === 'analytics' && (
          <>
            {analyticsLoading && <p style={{ color: 'var(--color-gray)' }}>Loading analytics...</p>}
            {analyticsError && <p className="text-sm text-red-600">{analyticsError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} change={stats.usersChange} trend={getTrendFromChange(stats.usersChange)} icon={Users} color="#8CE4FF" />
              <StatCard title="Stories Shared" value={stats.storiesShared.toLocaleString()} change={stats.storiesChange} trend={getTrendFromChange(stats.storiesChange)} icon={FileText} color="#FEEE91" />
              <StatCard title="Rice Donated" value={`${(stats.riceDonated / 1000).toFixed(1)}K`} change={stats.riceChange} trend={getTrendFromChange(stats.riceChange)} icon={Gamepad2} color="#FFA239" />
              <StatCard title="Donations Made" value={`$${stats.donationsMade.toLocaleString()}`} change={stats.donationsChange} trend={getTrendFromChange(stats.donationsChange)} icon={Heart} color="#FF5656" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="User Growth & Stories">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#8CE4FF" strokeWidth={2.5} name="Users" dot={{ fill: '#8CE4FF', r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="stories" stroke="#FFA239" strokeWidth={2.5} name="Stories" dot={{ fill: '#FFA239', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Donations by Month">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={donationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 11 }} />
                    <YAxis stroke={axisColor} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Donations']} />
                    <Bar dataKey="amount" fill="#FF5656" name="Donations ($)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard title={riceRange === '7d' ? 'FreeRice Activity (Past 7 Days)' : riceRange === '4w' ? 'FreeRice Activity (Past 4 Weeks)' : 'FreeRice Activity (Past 4 Months)'}>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {(['7d', '4w', '4m'] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRiceRange(r)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                    style={{ backgroundColor: riceRange === r ? '#8CE4FF' : 'transparent', border: riceRange === r ? '1px solid #8CE4FF' : '1px solid var(--color-gray-light)', color: riceRange === r ? '#111' : 'var(--foreground)' }}>
                    {r === '7d' ? 'Past 7 Days' : r === '4w' ? 'Past 4 Weeks' : 'Past 4 Months'}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="period" stroke={axisColor} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" stroke={axisColor} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="grains" fill="#FFA239" name="Rice Grains" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="players" fill="#8CE4FF" name="Active Players" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
        {/* Addition by Christella - 04/14/2026 - added pending/approved/denied event tabs */}
        {adminTab === 'events' && (
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--color-gray-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Event Submissions
            </h2>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                type="button"
                onClick={async () => { setEventStatusView('pending'); await fetchPendingEvents(); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: eventStatusView === 'pending' ? '#B388FF' : 'transparent',
                  border: '1px solid rgba(179,136,255,0.3)',
                  color: eventStatusView === 'pending' ? '#111' : '#B388FF',
                }}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={async () => { setEventStatusView('approved'); await fetchApprovedEvents(); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: eventStatusView === 'approved' ? '#22c55e' : 'transparent',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: eventStatusView === 'approved' ? '#111' : '#22c55e',
                }}
              >
                Approved
              </button>

              <button
                type="button"
                onClick={async () => { setEventStatusView('rejected'); await fetchRejectedEvents(); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: eventStatusView === 'rejected' ? '#FF5656' : 'transparent',
                  border: '1px solid rgba(255,86,86,0.3)',
                  color: eventStatusView === 'rejected' ? '#111' : '#FF5656',
                }}
              >
                Denied
              </button>
            </div>

            {eventsLoading && <p style={{ color: 'var(--color-gray)' }}>Loading pending events...</p>}
            {eventsError && <p className="text-sm text-red-500 mb-3">{eventsError}</p>}
            {!eventsLoading && !eventsError && pendingEvents.length === 0 && (
              <p style={{ color: 'var(--color-gray)' }}>No pending event submissions right now.</p>
            )}

            <div className="space-y-4">
              {visibleEvents.map((event) => (
                <div
                  key={event._id}
                  className="rounded-lg p-4"
                  style={{
                    border: '1px solid var(--color-gray-light)',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fbfbfb',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                        {event.title}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                        {event.type} • {event.location || 'Global'}
                        {event.date ? ` • ${new Date(event.date + 'T00:00:00').toLocaleDateString()}` : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-gray)' }}>
                        Submitted by: {event.submittedBy || 'Anonymous'}
                        {event.submittedEmail ? ` (${event.submittedEmail})` : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                    {event.description}
                  </p>

                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-medium mb-3 hover:underline"
                      style={{ color: '#8CE4FF' }}
                    >
                      {event.sourceLabel || 'View Source'}
                    </a>
                  )}

                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      placeholder="Optional reason if denying this event..."
                      value={eventReviewNotes[event._id] || ''}
                      onChange={(e) =>
                        setEventReviewNotes((prev) => ({ ...prev, [event._id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--color-gray-light)',
                        color: 'var(--foreground)',
                      }}
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={actionLoadingKey === `approve-event-${event._id}`}
                        onClick={() => handleApproveEvent(String(event._id))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        style={{ backgroundColor: '#22c55e', color: '#fff' }}
                      >
                        {actionLoadingKey === `approve-event-${event._id}` ? 'Approving...' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingKey === `reject-event-${event._id}`}
                        onClick={() => handleRejectEvent(String(event._id))}
                        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        style={{ backgroundColor: '#FF5656', color: '#fff' }}
                      >
                        {actionLoadingKey === `reject-event-${event._id}` ? 'Denying...' : 'Deny'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* End of addition by Christella - 04/14/2026 */}
      </div>
    </div>
  );
}