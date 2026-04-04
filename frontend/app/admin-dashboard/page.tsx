// PovertyLens Admin Dashboard
// Created by Marisol Morales for Work Review 3

"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider'; // Marisol's ThemeProvider - provides isDark via theme === 'dark'
import { Users, Heart, FileText, Gamepad2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

//START Added by Damon - 04/03/2026
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface StoryReport {
  _id: string;
  reason: string;
  reportedBy?: string | null;
  status: 'open' | 'ignored';
  createdAt?: string;
}

interface ReportedStory {
  _id: string;
  title?: string;
  storyText?: string;
  country?: string | null;
  userEmail?: string | null;
  createdAt?: string;
  reports?: StoryReport[];
}
//END Added by Damon - 04/03/2026

// Analytics types
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

interface UserGrowthPoint {
  month: string;
  users: number;
  stories: number;
}

interface DonationPoint {
  month: string;
  amount: number;
}

interface RicePoint {
  period: string;
  grains: number;
  players: number;
}

// ============== Stat Card ==============
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
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
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor:
              trend === 'up'
                ? 'rgba(34,197,94,0.1)'
                : trend === 'down'
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(156,163,175,0.15)', // gray
            color:
              trend === 'up'
                ? '#22c55e'
                : trend === 'down'
                ? '#ef4444'
                : '#9ca3af', // gray text
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

// ============== Chart Card wrapper ==============
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--background)',
        border: '1px solid var(--color-gray-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ============== Admin Dashboard Page ==============
export default function AdminDashboardPage() {
  const { theme } = useTheme(); // Uses Marisol's ThemeProvider — no MutationObserver needed
  const isDark = theme === 'dark';
  //START Added by Damon - 04/03/2026
  const [adminTab, setAdminTab] = useState<'analytics' | 'reports'>('analytics');
  const [reportedStoriesLoading, setReportedStoriesLoading] = useState(false);
  const [reportedStoriesError, setReportedStoriesError] = useState('');
  const [reportedStories, setReportedStories] = useState<ReportedStory[]>([]);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
//END Added by Damon - 04/03/2026

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    storiesShared: 0,
    riceDonated: 0,
    donationsMade: 0,
    usersChange: '+0%',
    storiesChange: '+0%',
    riceChange: '+0%',
    donationsChange: '+0%',
  });
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthPoint[]>([]);
  const [donationData, setDonationData] = useState<DonationPoint[]>([]);
  const [riceData, setRiceData] = useState<RicePoint[]>([]);
  const [riceRange, setRiceRange] = useState<'7d' | '4w' | '4m'>('4w');

  const getTrendFromChange = (change: string): 'up' | 'down' | 'neutral' => {
    const value = parseFloat(change.replace('%', ''));

    if (isNaN(value)) return 'neutral';
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  // Recharts styles that adapt to dark/light mode
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const axisColor = isDark ? 'var(--color-gray)' : '#888';
  const tooltipStyle = {
    backgroundColor: 'var(--background)',
    border: '1px solid var(--color-gray-light)',
    borderRadius: '8px',
    color: 'var(--foreground)',
  };

  // Analytics loading
  const fetchAnalytics = useCallback(async (selectedRange?: '7d' | '4w' | '4m') => {
    setAnalyticsLoading(true);
    setAnalyticsError('');

    try {
      const rangeToUse = selectedRange || riceRange;
      const res = await fetch(`${BACKEND_URL}/api/admin/analytics?range=${rangeToUse}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load analytics');
      }

      setStats(data.stats || {
        totalUsers: 0,
        storiesShared: 0,
        riceDonated: 0,
        donationsMade: 0,
        usersChange: '+0%',
        storiesChange: '+0%',
        riceChange: '+0%',
        donationsChange: '+0%',
      });

      setUserGrowthData(Array.isArray(data.userGrowthData) ? data.userGrowthData : []);
      setDonationData(Array.isArray(data.donationData) ? data.donationData : []);
      setRiceData(Array.isArray(data.riceData) ? data.riceData : []);
    } catch (err: any) {
      setAnalyticsError(err?.message || 'Failed to load analytics');
      setUserGrowthData([]);
      setDonationData([]);
      setRiceData([]);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [riceRange]);

  useEffect(() => {
    fetchAnalytics(riceRange);
  }, [fetchAnalytics, riceRange]);

  //START Added by Damon - 04/03/2026
  const fetchReportedStories = useCallback(async () => {
    setReportedStoriesLoading(true);
    setReportedStoriesError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/stories/reported?status=open`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load reported stories');
      }

      const list = Array.isArray(data.stories) ? data.stories : [];
      setReportedStories(list);
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
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to ignore report');
      }

      await fetchReportedStories();
    } catch (err: any) {
      setReportedStoriesError(err?.message || 'Failed to ignore report');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchReportedStories]);

  const handleDeleteStory = useCallback(async (storyId: string) => {
    if (!window.confirm('Delete this story? This action cannot be undone.')) {
      return;
    }

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
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete story');
      }

      await fetchReportedStories();
    } catch (err: any) {
      setReportedStoriesError(err?.message || 'Failed to delete story');
    } finally {
      setActionLoadingKey(null);
    }
  }, [fetchReportedStories]);
//END Added by Damon - 04/03/2026

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                Admin Dashboard
            </h1>
            <p className="text-base" style={{ color: 'var(--color-gray)' }}>
                Monitor PovertyLens platform impact and engagement
            </p>
        </div>
    </div>

          {adminTab === 'analytics' ? (
            <button
              type="button"
              onClick={async () => {
                setAdminTab('reports');
                await fetchReportedStories();
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: 'rgba(140, 228, 255, 0.1)',
                border: '1px solid rgba(140, 228, 255, 0.3)',
                color: '#8CE4FF',
              }}
            >
              View Reported Stories
              {/* //START Added by Damon - 04/03/2026 */}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAdminTab('analytics')}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                backgroundColor: '#FF5656',
                border: '1px solid #FF5656',
                color: '#ffffff',
              }}
            >
              Back to Analytics
            </button>
          )}
        </div>
        {/* //START Added by Damon - 04/03/2026 */}

{/* //START Added by Damon - 04/03/2026 */}
        {adminTab === 'reports' && (
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--color-gray-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              Reported Stories
            </h2>

            {reportedStoriesLoading && (
              <p style={{ color: 'var(--color-gray)' }}>Loading reported stories...</p>
            )}

            {reportedStoriesError && (
              <p className="text-sm text-red-600 mb-3">{reportedStoriesError}</p>
            )}

            {!reportedStoriesLoading && !reportedStoriesError && reportedStories.length === 0 && (
              <p style={{ color: 'var(--color-gray)' }}>No open reports right now.</p>
            )}

            <div className="space-y-4">
              {reportedStories.map((story) => {
                const openReports = Array.isArray(story.reports)
                  ? story.reports.filter((r) => r.status === 'open')
                  : [];

                return (
                  <div
                    key={story._id}
                    className="rounded-lg p-4"
                    style={{
                      border: '1px solid var(--color-gray-light)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fbfbfb',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                          {story.title?.trim() ? story.title : 'Untitled Story'}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--color-gray)' }}>
                          {story.country ? `Country: ${story.country}` : 'Country: N/A'}
                          {story.createdAt ? ` • Created: ${new Date(story.createdAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>

                    <p
                      className="text-sm mb-3 whitespace-pre-wrap"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {(story.storyText || '').slice(0, 250)}
                      {(story.storyText || '').length > 250 ? '...' : ''}
                    </p>

                    <div className="space-y-2">
                      {openReports.map((report) => {
                        const key = `ignore-${story._id}-${report._id}`;
                        return (
                          <div
                            key={report._id}
                            className="rounded-md p-3"
                            style={{
                              border: '1px solid var(--color-gray-light)',
                              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                            }}
                          >
                            <p className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                              {report.reason}
                            </p>
                            <p className="text-xs mb-2" style={{ color: 'var(--color-gray)' }}>
                              {report.reportedBy ? `Reported by: ${report.reportedBy}` : 'Reported by: Anonymous'}
                              {report.createdAt ? ` • ${new Date(report.createdAt).toLocaleString()}` : ''}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actionLoadingKey === key}
                                onClick={() => handleIgnoreReport(story._id, report._id)}
                                className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
                                style={{
                                  border: '1px solid var(--color-gray-light)',
                                  color: 'var(--foreground)',
                                  backgroundColor: 'var(--background)',
                                }}
                              >
                                {actionLoadingKey === key ? 'Ignoring...' : 'Ignore Report'}
                              </button>
                              <button
                                type="button"
                                disabled={actionLoadingKey === `delete-${story._id}`}
                                onClick={() => handleDeleteStory(story._id)}
                                className="px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-60"
                                style={{ backgroundColor: '#FF5656', color: '#fff' }}
                              >
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
{/* //END Added by Damon - 04/03/2026 */}
        {adminTab === 'analytics' && (
          <>
            {analyticsLoading && (
              <p style={{ color: 'var(--color-gray)' }}>Loading analytics...</p>
            )}

            {analyticsError && (
              <p className="text-sm text-red-600">{analyticsError}</p>
            )}

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                change={stats.usersChange}
                trend={getTrendFromChange(stats.usersChange)}
                icon={Users}
                color="#8CE4FF"
              />
              <StatCard
                title="Stories Shared"
                value={stats.storiesShared.toLocaleString()}
                change={stats.storiesChange}
                trend={getTrendFromChange(stats.storiesChange)}
                icon={FileText}
                color="#FEEE91"
              />
              <StatCard
                title="Rice Donated"
                value={`${(stats.riceDonated / 1000).toFixed(1)}K`}
                change={stats.riceChange}
                trend={getTrendFromChange(stats.riceChange)}
                icon={Gamepad2}
                color="#FFA239"
              />
              <StatCard
                title="Donations Made"
                value={`$${stats.donationsMade.toLocaleString()}`}
                change={stats.donationsChange}
                trend={getTrendFromChange(stats.donationsChange)}
                icon={Heart}
                color="#FF5656"
              />
            </div>

            {/* ── Two column charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <ChartCard title="User Growth & Stories">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left"  stroke={axisColor} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line yAxisId="left"  type="monotone" dataKey="users"   stroke="#8CE4FF" strokeWidth={2.5} name="Users"   dot={{ fill: '#8CE4FF', r: 4 }} activeDot={{ r: 6 }} />
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

            {/* ── FreeRice Activity ── */}
            <ChartCard
              title={
                riceRange === '7d'
                  ? 'FreeRice Activity (Past 7 Days)'
                  : riceRange === '4w'
                  ? 'FreeRice Activity (Past 4 Weeks)'
                  : 'FreeRice Activity (Past 4 Months)'
              }
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRiceRange('7d')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: riceRange === '7d' ? '#8CE4FF' : 'transparent',
                    border: riceRange === '7d' ? '1px solid #8CE4FF' : '1px solid var(--color-gray-light)',
                    color: riceRange === '7d' ? '#111' : 'var(--foreground)',
                  }}
                >
                  Past 7 Days
                </button>

                <button
                  type="button"
                  onClick={() => setRiceRange('4w')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: riceRange === '4w' ? '#8CE4FF' : 'transparent',
                    border: riceRange === '4w' ? '1px solid #8CE4FF' : '1px solid var(--color-gray-light)',
                    color: riceRange === '4w' ? '#111' : 'var(--foreground)',
                  }}
                >
                  Past 4 Weeks
                </button>

                <button
                  type="button"
                  onClick={() => setRiceRange('4m')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: riceRange === '4m' ? '#8CE4FF' : 'transparent',
                    border: riceRange === '4m' ? '1px solid #8CE4FF' : '1px solid var(--color-gray-light)',
                    color: riceRange === '4m' ? '#111' : 'var(--foreground)',
                  }}
                >
                  Past 4 Months
                </button>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="period" stroke={axisColor} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left"  stroke={axisColor} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" stroke={axisColor} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar yAxisId="left"  dataKey="grains"  fill="#FFA239" name="Rice Grains"    radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="players" fill="#8CE4FF" name="Active Players" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}

      </div>
    </div>
  );
}