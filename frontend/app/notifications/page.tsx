'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  message: string;
  read: boolean;
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
    
    // Initial fetch
    fetch(`http://localhost:4000/api/notifications?userId=${email}`)
      .then(res => res.json())
      .then((data: ApiResponse) => {
        if (data.success) {
          setNotifications(data.notifications);
        }
        setLoading(false);
      });
    
    const intervalId = setInterval(fetchNotifications, 5000);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (id: string): Promise<void> => {
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
      <h1 className="text-3xl font-bold mb-6" style={{ color: isDark ? '#FFB660' : '#623100' }}> {/* Changed by Marisol 2/10/2026 for Dark Mode Support */}
        Notifications</h1> 
      
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
                  ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgb(249, 250, 251)') // Changed by Marisol 2/10/2026 for Dark Mode Support
                  : (isDark ? 'rgba(254, 238, 145, 0.1)' : '#F9F5ED') // Changed by Marisol 2/10/2026 for Dark Mode Support
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
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgb(219, 234, 254)', // Changed by Marisol 2/10/2026 for Dark Mode Support
                      color: isDark ? '#93c5fd' : 'rgb(30, 64, 175)' // Changed by Marisol 2/10/2026 for Dark Mode Support
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