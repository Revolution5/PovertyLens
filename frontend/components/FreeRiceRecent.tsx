"use client"
//Reymes 1/31/26
import React, { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

type Donation = { _id?: string; email?: string | null; username?: string | null; grains: number; createdAt: string }

export default function FreeRiceRecent() {
  const [recent, setRecent] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
  }, [])

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10">
      <h3 className="text-xl font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Recent Activity</h3>

      {loading ? (
        <div className="text-center py-6 text-gray-400">Loading...</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.length === 0 && <li className="text-gray-500">No recent activity</li>}
          {recent.map((r) => (
            <li key={(r as any)._id} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FEEE91] flex items-center justify-center text-sm font-semibold text-white">{(r.username || r.email || 'A').charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-sm font-medium text-gray-900">{r.username || r.email || 'Anonymous'}</div>
                <div className="text-sm text-gray-600">donated <strong>{r.grains}</strong> grains — {new Date(r.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}