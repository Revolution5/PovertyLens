// daniel q. added 4/22/26

'use client';

import { useEffect, useState } from 'react';
import RewardsShop from '@/components/RewardsShop';

export default function RewardsShopPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  // If user is not logged in, show a message
  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--color-gray-light)' }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Rewards Shop</h1>
          <p style={{ color: 'var(--color-gray)' }}>Please sign in to view the Rewards Shop and spend your points!</p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="mt-4 px-6 py-2 rounded-lg text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header Section - Matching other pages */}
      <div style={{ paddingTop: 40, paddingLeft: 80, paddingRight: 80 }}>
        <header style={{ marginBottom: 32, paddingLeft: 24 }}>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}
          >
            Rewards Shop
          </h1>
          <div style={{ height: 4, width: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cyan-yellow)', margin: '0 0 24px 0' }} />
          <p style={{ margin: 0, fontSize: 20, lineHeight: 1.7, color: 'var(--color-gray-dark)' }}>
            Spend your hard-earned points on exclusive profile customizations and badges!
          </p>
        </header>
      </div>

      {/* Rewards Shop Component */}
      <RewardsShop userEmail={userEmail} />
    </div>
  );
}