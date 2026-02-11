'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FreeRiceLeaderboardClient from '../../components/FreeRiceLeaderboardClient';
import FreeRiceRecent from '../../components/FreeRiceRecent';

export default function FreeRicePage() {
  // ============== Dark Mode Detection ============== //
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  // ============== End Dark Mode Detection ============== //

  return (
    // ============== Dark Mode: Updated page background ============== //
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
    {/* ============== End Dark Mode Background ============== */}
      {/* Hero */}
      {/* ============== Dark Mode: Updated hero gradient background ============== */}
      <section 
        className="py-12"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.05), var(--background), rgba(254, 238, 145, 0.05))'
            : 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.1), white, rgba(254, 238, 145, 0.1))'
        }}
      >
      {/* ============== End Dark Mode Hero ============== */}
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
            FreeRice — Play for Rice
          </h1>
          {/* ============== Dark Mode: Updated subtitle text ============== */}
          <p className="text-lg font-semibold max-w-2xl mx-auto mb-4" style={{ color: 'var(--color-gray-dark)' }}>
            Answer quick trivia. Earn grains. Help provide rice worldwide.
          </p>
          {/* ============== End Dark Mode Text ============== */}
        </div> 
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* ============== Dark Mode: Updated card backgrounds and borders ============== */}
          <div 
            className="p-6 rounded-2xl shadow-sm border flex flex-col items-center gap-4"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.1)'
            }}
          >
            <Image src="/WFP-trans.png" alt="WFP" width={260} height={260} className="object-contain rounded-md" />
            <a 
              href="https://freerice.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-2 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-[#FFA239] to-[#FF5656] text-white rounded-lg font-semibold shadow-md hover:opacity-95"
            >
              Play now
            </a>
          </div>

          <div 
            className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: isDark ? 'rgba(254, 238, 145, 0.4)' : 'rgba(254, 238, 145, 0.3)'
            }}
          >
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
              How it helps
            </h3>
            <p className="mt-3 text-sm" style={{ color: 'var(--color-gray-dark)' }}>
              Short summary:
            </p>
            <ul className="mt-3 space-y-2 text-sm list-disc pl-5" style={{ color: 'var(--color-gray)' }}>
              <li>
                <strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                  Education:
                </strong> Learn as you play
              </li>
              <li>
                <strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                  Donation:
                </strong> Sponsors convert correct answers to rice
              </li>
              <li>
                <strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                  Transparency:
                </strong> We log and display donations
              </li>
            </ul>
          </div>

          <div 
            className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.1)'
            }}
          >
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
              Community Impact
            </h3>
            <p className="mt-3 text-sm" style={{ color: 'var(--color-gray-dark)' }}>
              See the leaderboard and recent donations to understand our collective contribution. Small actions add up.
            </p>
          </div>

          <div>
            <FreeRiceRecent />
          </div>
          {/* ============== End Dark Mode Cards ============== */}
        </div>

        {/* Center + Right: Leaderboard + Donation Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* ============== Dark Mode: Updated card backgrounds and borders ============== */}
          <div 
            className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: isDark ? 'rgba(140, 228, 255, 0.2)' : 'rgba(140, 228, 255, 0.1)'
            }}
          >
            <FreeRiceLeaderboardClient showRecent={false} />
          </div>

          <div 
            className="p-6 rounded-2xl shadow-sm border"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: isDark ? 'rgba(254, 238, 145, 0.4)' : 'rgba(254, 238, 145, 0.3)'
            }}
          >
            <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Want more ways to help?
            </h3>
            <p className="mt-3 text-sm" style={{ color: 'var(--color-gray-dark)' }}>
              Visit our{' '}
              <Link href="/donationspages" className="underline text-[#FFA239] hover:text-[#FF8E1A]">
                Donations & Volunteer
              </Link>{' '}
              page to explore verified organizations and volunteer opportunities.
            </p>
          </div>
          {/* ============== End Dark Mode Cards ============== */}
        </div>
      </main>
    </div>
  );
}