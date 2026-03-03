"use client"
//Reymes 1/30/26
// Marisol Morales - 2/9/2026 - Added dark mode support
import React, { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

type Donation = { _id?: string; email?: string | null; username?: string | null; grains: number; createdAt: string }

export default function FreeRiceRecent({ refreshKey  = 0} : { refreshKey?: number }) // Changed by Marisol 2/16 -refreshKey prop to trigger re-fetch when it changes, used for auto-refresh after new donation
{
  const [recent, setRecent] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // ============== Marisol Morales Code for Dark Mode Detection 2/9/2026 ============== //
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
  // ============== End Of Marisols Code Dark Mode Detection 2/9/2026 ============== //

  async function fetchRecent() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${BACKEND_URL}/api/freerice/leaderboard`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setMessage(text || `Error fetching recent (status ${res.status})`)
        return
      }
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const text = await res.text().catch(() => '')
        setMessage('Unexpected response: ' + (text ? text.slice(0, 200) : ''))
        return
      }
      const data = await res.json()
      if (data && data.success) {
        setRecent(data.recent || [])
      } else {
        setMessage(data && data.message ? data.message : 'Could not load recent activity')
      }
    } catch (err) {
      console.error('fetch recent error', err)
      setMessage('Network error while fetching recent')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecent()
  }, [refreshKey]) // Changed by Marisol 2/16 to re-fetch recent donations whenever refreshKey changes, which happens after a new donation is logged in FreeRiceLeaderboardClient

  return (
    <div 
      className="p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <h3 className="text-xl font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Recent Activity</h3>

      {loading ? (
        <div className="text-center py-6" style={{ color: 'var(--color-gray)' }}>Loading...</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.length === 0 && <li style={{ color: 'var(--color-gray)' }}>No recent activity</li>}
          {recent.map((r) => (
            <li key={(r as any)._id} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FEEE91] flex items-center justify-center text-sm font-semibold text-white">{(r.username || r.email || 'A').charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{r.username || r.email || 'Anonymous'}</div>
                <div className="text-sm" style={{ color: 'var(--color-gray)' }}>donated <strong>{r.grains}</strong> grains – {new Date(r.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}//Reymes 1/30/26 - End of addition