// created by Marisol morales 2-28 for account activity log page

"use client"

import { useEffect, useState } from 'react';
import {
  LogIn, LogOut, Key, Mail, Shield, Download,
  Settings, UserCircle, AlertTriangle, CheckCircle,
  Search, Filter, X, Trash2, Clock
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type ActivityType =
  | 'login' | 'logout' | 'password_change' | 'email_change'
    | 'api_access' | 'download'
  | 'settings_change' | 'profile_update' | 'failed_login'
  | 'story' | 'rice' | 'general';

type ActivityStatus = 'success' | 'warning' | 'error';

type ActivityLog = {
  id: string;
  type: ActivityType;
  action: string;
  details: string;
  location?: { city: string; country: string; ip: string };
  timestamp: string;
  device?: string;
  status?: ActivityStatus;
};

// Map backend action strings → typed ActivityType
function inferType(action: string): ActivityType {
  if (action.includes('Signed in') || action.includes('login')) return 'login';
  if (action.includes('logout') || action.includes('Logged out')) return 'logout';
  if (action.includes('password')) return 'password_change';
  if (action.includes('email')) return 'email_change';
  if (action.includes('username') || action.includes('profile')) return 'profile_update';
  if (action.includes('story')) return 'story';
  if (action.includes('rice')) return 'rice';
  if (action.includes('download')) return 'download';
  if (action.includes('settings')) return 'settings_change';
  if (action.includes('Failed') || action.includes('failed')) return 'failed_login';
  return 'general';
}

const iconMap: Record<ActivityType, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  password_change: Key,
  email_change: Mail,
  api_access: Settings,
  download: Download,
  settings_change: Settings,
  profile_update: UserCircle,
  failed_login: AlertTriangle,
  story: UserCircle,
  rice: Download,
  general: Settings,
};

// Each activity type gets a bg + text color pair using project palette
const colorMap: Record<ActivityType, { bg: string; color: string }> = {
  login:           { bg: 'rgba(140, 228, 255, 0.15)', color: 'var(--color-cyan)' },
  logout:          { bg: 'rgba(102, 102, 102, 0.12)', color: 'var(--color-gray)' },
  password_change: { bg: 'rgba(254, 238, 145, 0.2)',  color: '#c9a800' },
  email_change:    { bg: 'rgba(140, 228, 255, 0.12)', color: 'var(--color-cyan)' },
  api_access:      { bg: 'rgba(255, 162, 57, 0.15)',  color: 'var(--color-orange)' },
  download:        { bg: 'rgba(140, 228, 255, 0.15)', color: 'var(--color-cyan)' },
  settings_change: { bg: 'rgba(254, 238, 145, 0.2)',  color: '#c9a800' },
  profile_update:  { bg: 'rgba(140, 228, 255, 0.12)', color: 'var(--color-cyan)' },
  failed_login:    { bg: 'rgba(255, 86, 86, 0.12)',   color: 'var(--color-red)' },
  story:           { bg: 'rgba(255, 162, 57, 0.15)',  color: 'var(--color-orange)' },
  rice:            { bg: 'rgba(100, 220, 130, 0.15)', color: '#2ecc71' },
  general:         { bg: 'rgba(102, 102, 102, 0.1)',  color: 'var(--color-gray)' },
};

const statusConfig = {
  success: { label: 'success', color: '#2ecc71',             bg: 'rgba(100,220,130,0.12)' },
  warning: { label: 'warning', color: 'var(--color-orange)', bg: 'rgba(255,162,57,0.12)'  },
  error:   { label: 'error',   color: 'var(--color-red)',    bg: 'rgba(255,86,86,0.12)'   },
};

const filterOptions = [
  { value: 'all',             label: 'All Activities' },
  { value: 'login',           label: 'Login'          },
  { value: 'logout',          label: 'Logout'         },
  { value: 'password_change', label: 'Password'       },
  { value: 'email_change',    label: 'Email'          },
  { value: '2fa_enabled',     label: '2FA'            },
  { value: 'profile_update',  label: 'Profile'        },
  { value: 'story',           label: 'Stories'        },
  { value: 'rice',            label: 'Rice Donations' },
  { value: 'failed_login',    label: 'Failed Logins'  },
];

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ── ActivityItem ─────────────────────────────────────────────────────────────
function ActivityItem({ activity }: { activity: ActivityLog }) {
  const Icon = iconMap[activity.type] ?? Settings;
  const { bg, color } = colorMap[activity.type] ?? colorMap.general;
  const status = activity.status ? statusConfig[activity.status] : null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--color-gray-light)',
        transition: 'background var(--transition-fast)',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(140,228,255,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Icon bubble */}
      <div style={{
        flexShrink: 0,
        width: 40, height: 40,
        borderRadius: '50%',
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
              {activity.action}
            </p>

            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              gap: '0.5rem', marginTop: '0.35rem',
              fontSize: '0.78rem', color: 'var(--color-gray)',
            }}>
              <span>{formatTimestamp(activity.timestamp)}</span>

              {activity.device && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{activity.device}</span>
                </>
              )}

              {activity.location && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{activity.location.city}, {activity.location.country}</span>
                </>
              )}

              {activity.location?.ip && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                    {activity.location.ip}
                  </span>
                </>
              )}

              {activity.details && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{activity.details}</span>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          {status && (
            <span style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 600,
              backgroundColor: status.bg,
              color: status.color,
              textTransform: 'capitalize',
            }}>
              {activity.status === 'success' && <CheckCircle style={{ width: 11, height: 11 }} />}
              {activity.status === 'error'   && <AlertTriangle style={{ width: 11, height: 11 }} />}
              {status.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true);
    fetch(`${BACKEND_URL}/api/activity-log?email=${encodeURIComponent(userEmail)}&limit=50`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLogs(data.logs.map((log: ActivityLog & { action: string }) => ({
            ...log,
            type: inferType(log.action),
            status: log.action.toLowerCase().includes('fail') ? 'error' : 'success',
          })));
        } else {
          setError(data.message || 'Failed to load activity');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [userEmail]);

  const handleClear = async () => {
    const password = window.prompt('Enter your password to clear activity log:');
    if (!password) return;
    const res = await fetch(`${BACKEND_URL}/api/activity-log/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password }),
    });
    const data = await res.json();
    if (data.success) { setLogs([]); setShowClearConfirm(false); }
    else alert(data.message || 'Failed to clear log');
  };

  const filtered = logs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase())
      || log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterType === 'all' || log.type === filterType;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{
                fontSize: '1.75rem', fontWeight: 700,
                color: 'var(--foreground)', margin: 0,
              }}>
                Account Activity
              </h1>
              <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                Monitor all activity and changes to your account
              </p>
            </div>

            {logs.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem', fontWeight: 500,
                  backgroundColor: 'rgba(255,86,86,0.08)',
                  color: 'var(--color-red)',
                  border: '1px solid rgba(255,86,86,0.25)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,86,86,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,86,86,0.08)')}
              >
                <Trash2 style={{ width: 15, height: 15 }} />
                Clear Log
              </button>
            )}
          </div>
        </div>

        {/* ── Clear Confirm Banner ── */}
        {showClearConfirm && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,86,86,0.3)',
            backgroundColor: 'rgba(255,86,86,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <p style={{ color: 'var(--foreground)', fontSize: '0.875rem', margin: 0 }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem', border: '1px solid var(--color-gray-light)',
                  color: 'var(--foreground)', backgroundColor: 'transparent',
                }}
              >Cancel</button>
              <button
                onClick={handleClear}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem', border: 'none',
                  color: '#fff', backgroundColor: 'var(--color-red)',
                }}
              >Yes, Clear</button>
            </div>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-gray-light)',
          backgroundColor: 'var(--background)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 15, height: 15, color: 'var(--color-gray)',
            }} />
            <input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: '2rem', paddingRight: '0.75rem',
                paddingTop: '0.5rem', paddingBottom: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gray-light)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', padding: 0, color: 'var(--color-gray)',
                }}
              >
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gray-light)',
                backgroundColor: filterType !== 'all' ? 'rgba(140,228,255,0.1)' : 'var(--background)',
                color: filterType !== 'all' ? 'var(--color-cyan)' : 'var(--foreground)',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Filter style={{ width: 14, height: 14 }} />
              {filterOptions.find(o => o.value === filterType)?.label ?? 'Filter'}
            </button>

            {filterOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
                minWidth: 180,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-gray-light)',
                backgroundColor: 'var(--background)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}>
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilterType(opt.value); setFilterOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.55rem 1rem', fontSize: '0.85rem',
                      color: filterType === opt.value ? 'var(--color-cyan)' : 'var(--foreground)',
                      backgroundColor: filterType === opt.value ? 'rgba(140,228,255,0.08)' : 'transparent',
                      border: 'none',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => {
                      if (filterType !== opt.value) e.currentTarget.style.backgroundColor = 'rgba(140,228,255,0.05)';
                    }}
                    onMouseLeave={e => {
                      if (filterType !== opt.value) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setFilterType('all'); }}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-gray-light)',
                color: 'var(--color-gray)',
                backgroundColor: 'var(--background)',
                fontSize: '0.85rem',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Activity List Card ── */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-gray-light)',
          backgroundColor: 'var(--background)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray)' }}>
              <Clock style={{ width: 32, height: 32, margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ margin: 0 }}>Loading activity...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-red)' }}>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray)' }}>
              <p style={{ margin: 0 }}>No activities found matching your criteria</p>
            </div>
          ) : (
            filtered.map(log => <ActivityItem key={log.id} activity={log} />)
          )}
        </div>

        {/* ── Count ── */}
        {!loading && !error && (
          <p style={{
            marginTop: '1rem', textAlign: 'center',
            fontSize: '0.8rem', color: 'var(--color-gray)',
          }}>
            Showing {filtered.length} of {logs.length} activities
          </p>
        )}
      </div>
    </div>
  );
}