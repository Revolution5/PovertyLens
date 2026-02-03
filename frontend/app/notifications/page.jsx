'use client';

import { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    (async () => {
      try {
        const [nRes, fRes] = await Promise.all([
          fetch(`http://localhost:4000/api/notifications?userId=${email}`),
          fetch('http://localhost:4000/api/daily-fact')
        ]);
        const nData = await nRes.json();
        const fData = await fRes.json();

        let list = nData.notifications || [];
        if (fData?.success && fData.fact) {
          const fact = fData.fact;
          const factItem = {
            id: fact._id || 'dailyfact',
            message: (fact.title ? fact.title + ': ' : '') + (fact.text || ''),
            createdAt: new Date().toISOString(),
            read: false,
          };
          list = [factItem, ...list];
        }

        if (nData.success) setNotifications(list);
      } catch (err) {
        console.error('Error fetching notifications or daily fact:', err);
      } finally {
        setLoading(false);
      }
    })();
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#623100] mb-6">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div 
              key={note.id} 
              className={`p-4 rounded-lg border ${note.read ? 'border-gray-200 bg-gray-50' : 'border-[#C8AB8F] bg-[#F9F5ED]'} hover:shadow transition-shadow cursor-pointer`}
              onClick={() => !note.read && markAsRead(note.id)}
            >
              <p className="text-gray-800">{note.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(note.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {!note.read && (
                  <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
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