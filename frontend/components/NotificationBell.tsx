"use client";
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
// Start of Added by Marisol for Dark Mode - 2/8/2026
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
// End of Marisol's Code for Dark Mode Detection - 2/8/2026
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      const response = await fetch(`http://localhost:4000/api/notifications?userId=${userEmail}`).catch(() => null);
      if (!response) {
        setNotifications([]);
        return;
      }
      const data = await response.json();
      setNotifications(data.notifications || []);
      
      const unread = data.notifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      setNotifications([]);
    }
  };

   const clearAllNotifications = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      const response = await fetch('http://localhost:4000/api/notifications/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userEmail })
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false); // Close the dropdown after clearing
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors"
        style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' // Changed by Marisol for Dark Mode - 2/8/2026
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'; // Changed by Marisol for Dark Mode - 2/8/2026
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol for Dark Mode - 2/8/2026
        }}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--color-gray-light)'
          }}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Header */}
          <div 
            className="p-4 border-b"
            style={{ borderColor: 'var(--color-gray-light)' }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</h3>

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm font-medium px-2 py-1 rounded transition-colors"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    color: '#EF4444'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center" style={{ color: 'var(--color-gray)' }}>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>

                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-4 border-b transition-colors"
                      style={{
                        borderColor: 'var(--color-gray-light)',
                        backgroundColor: !notification.read 
                          ? (isDark ? 'rgba(140, 228, 255, 0.1)' : 'rgba(140, 228, 255, 0.15)') // Changed by Marisol for Dark Mode - 2/8/2026
                          : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'; // Changed by Marisol for Dark Mode - 2/8/2026
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = !notification.read 
                          ? (isDark ? 'rgba(140, 228, 255, 0.1)' : 'rgba(140, 228, 255, 0.15)') // Changed by Marisol for Dark Mode - 2/8/2026
                          : 'transparent';
                      }}
                    >
                      <p style={{ color: 'var(--foreground)' }}>{notification.message}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-gray)' }}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}