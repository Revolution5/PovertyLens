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
  const [dailyFact, setDailyFact] = useState<null | { _id?: string; title?: string; text?: string }>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      const response = await fetch(`http://localhost:4000/api/notifications?userId=${userEmail}`);
      const data = await response.json();
      setNotifications(data.notifications || []);

      const unread = data.notifications.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);

      // fetch daily fact and insert at top
      try {
        const fRes = await fetch('http://localhost:4000/api/daily-fact');
        const fData = await fRes.json();
        if (fData?.success && fData.fact) {
          setDailyFact(fData.fact);
        } else {
          setDailyFact(null);
        }
      } catch (e) {
        console.error('Error fetching daily fact:', e);
        setDailyFact(null);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      await fetch('http://localhost:4000/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userEmail })
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
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
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                  {/* show daily fact at top if present */}
                  {dailyFact && (
                    <div key={dailyFact._id || 'dailyfact'} className={`p-4 border-b border-gray-100 hover:bg-gray-50 bg-yellow-50`}>
                      <p className="text-gray-800 font-semibold">{dailyFact.title || 'Daily Fact'}</p>
                      <p className="text-gray-800 mt-1">{dailyFact.text}</p>
                      <p className="text-xs text-gray-500 mt-1">Today</p>
                    </div>
                  )}
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
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