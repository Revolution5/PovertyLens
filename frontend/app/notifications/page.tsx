'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  notifications: Notification[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  // Added by Marisol 2/10/2026 for Dark Mode Support
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
  // End of Code by Marisol 2/10/2026 for Dark Mode Support

  const fetchNotifications = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/notifications?userId=${email}`);
      const data: ApiResponse = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    fetch(`http://localhost:4000/api/notifications?userId=${email}`)
      .then(res => res.json())
      .then((data: ApiResponse) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
        setLoading(false);
      });
    
    const intervalId = setInterval(fetchNotifications, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const clearAllNotifications = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    try {
      const response = await fetch('http://localhost:4000/api/notifications/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email })
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  if (loading) return <div className="p-8" style={{ color: 'var(--foreground)' }}>Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: isDark ? '#FFB660' : '#623100' }}>
          Notifications
        </h1>
        
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--color-gray)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className="p-4 rounded-lg border hover:shadow transition-shadow"
              style={{
                borderColor: 'var(--color-gray-light)',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgb(249, 250, 251)'
              }}
            >
              <p style={{ color: 'var(--foreground)' }}>{note.message}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-gray)' }}>
                {new Date(note.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}