'use client';

import { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    fetch(`http://localhost:4000/api/notifications?userId=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotifications(data.notifications);
        }
        setLoading(false);
      });
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
        method: 'POST'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(note => 
          note.id === id ? { ...note, read: true } : note
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="p-8" style={{ color: 'var(--foreground)' }}>Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: isDark ? '#FFB660' : '#623100' }}>Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: 'var(--color-gray)' }}>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className="p-4 rounded-lg border hover:shadow transition-shadow cursor-pointer"
              style={{
                borderColor: note.read ? 'var(--color-gray-light)' : '#C8AB8F',
                backgroundColor: note.read 
                  ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgb(249, 250, 251)')
                  : (isDark ? 'rgba(254, 238, 145, 0.1)' : '#F9F5ED')
              }}
              onClick={() => !note.read && markAsRead(note.id)}
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
                {!note.read && (
                  <span 
                    className="ml-3 px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgb(219, 234, 254)',
                      color: isDark ? '#93c5fd' : 'rgb(30, 64, 175)'
                    }}
                  >
                    New
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}