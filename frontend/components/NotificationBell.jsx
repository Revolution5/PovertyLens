// components/NotificationBell.jsx
'use client';

import { useState, useEffect } from 'react';

// Simple bell SVG icon
function BellIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="40" 
      height="40" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="text-[#623100]"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      checkNotifications(email);
      
      // Check every 30 seconds
      const interval = setInterval(() => checkNotifications(email), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const checkNotifications = async (email) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications?userId=${email}`);
      const data = await response.json();
      
      if (data.success) {
        const unread = data.notifications.filter(n => !n.read).length;
        setCount(unread);
      }
    } catch (err) {
      console.log('Could not fetch notifications');
    }
  };

  if (!userEmail) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => window.location.href = '/notifications'}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <BellIcon />
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}