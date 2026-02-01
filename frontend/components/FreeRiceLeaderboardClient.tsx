"use client"
//Reymes 1/31/26
import React, { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

type TopEntry = { email: string | null; username: string | null; totalGrains: number }
type Donation = { _id?: string; email?: string | null; username?: string | null; grains: number; createdAt: string }

export default function FreeRiceLeaderboardClient({ showRecent = true }: { showRecent?: boolean }) {
  const [top, setTop] = useState<TopEntry[]>([])
  const [recent, setRecent] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number | ''>('')
  const [grains, setGrains] = useState<number | ''>('')
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  async function fetchLeaderboard(email?: string) {
    setLoading(true)
    setMessage(null)
    try {
      const url = email ? `${BACKEND_URL}/api/freerice/leaderboard?email=${encodeURIComponent(email)}` : `${BACKEND_URL}/api/freerice/leaderboard`
      const res = await fetch(url)

      // Handle non-OK HTTP responses
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('Leaderboard fetch failed:', res.status, text)
        setMessage(text || `Error fetching leaderboard (status ${res.status})`)
        return
      }

      // Guard against HTML/non-JSON responses (e.g., development server returned an HTML page)
      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '')
        console.error('Leaderboard returned non-JSON content:', text && text.slice(0, 200))
        setMessage('Server returned unexpected response: ' + (text ? text.slice(0, 200) : ''))
        return
      }

      const data = await res.json()
      if (data && data.success) {
        setTop(data.top || [])
        setRecent(data.recent || [])
      } else {
        setMessage(data && data.message ? data.message : 'Could not load leaderboard')
      }
    } catch (err) {
      console.error('fetch leaderboard error', err)
      setMessage('Network error while fetching leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null
    setSessionEmail(email)
    fetchLeaderboard(email || undefined)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null
    if (!email) return setMessage('Please sign in to log a donation')

    let computedGrains = 0
    if (answers !== '' && Number(answers) > 0) computedGrains = Math.floor(Number(answers)) * 10
    else if (grains !== '' && Number(grains) > 0) computedGrains = Math.floor(Number(grains))
    else return setMessage('Enter answers or grains')

    try {
      const res = await fetch(`${BACKEND_URL}/api/freerice/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grains: computedGrains, email }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('Donation failed:', res.status, text)
        setMessage(text || `Error logging donation (status ${res.status})`)
        return
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '')
        console.error('Donate returned non-JSON:', text && text.slice(0, 200))
        setMessage('Server returned unexpected response: ' + (text ? text.slice(0, 200) : ''))
        return
      }

      const data = await res.json()
      if (res.status === 201 && data && data.success) {
        setMessage('Donation logged — thank you!')
        setAnswers('')
        setGrains('')
        fetchLeaderboard(email)
      } else {
        setMessage(data && data.message ? data.message : 'Could not log donation')
      }
    } catch (err) {
      console.error('donate error', err)
      setMessage('Network error while logging donation')
    }
  }

  return (
    <div className="py-10">
      <section className="max-w-6xl mx-auto px-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Leaderboard</h1>
          <p className="mt-3 text-lg font-semibold text-gray-700">Log activity. See community impact.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Top Contributors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top Contributors</h2>
                <div className="text-sm text-gray-500">{top.length} entries</div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading leaderboard...</div>
                ) : (
                  <ol className="space-y-3">
                    {top.length === 0 && <li className="text-gray-500">No donations yet. Be the first!</li>}
                    {top.map((t, i) => (
                      <li key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="text-sm text-gray-500">#{i + 1}</div>
                          <div className="font-semibold text-gray-900">{t.username || t.email || 'Anonymous'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">{t.totalGrains.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">grains</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {showRecent && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10">
                <h3 className="text-xl font-bold">Recent Activity</h3>
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
              </div>
            )}
          </div>

          {/* Right: Donation form */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FEEE91]/30 flex flex-col gap-4">
              <div className="mb-2">
                {sessionEmail ? (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm whitespace-normal break-words">Signed in as <strong className="font-semibold">{sessionEmail}</strong></div>
                ) : (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm whitespace-normal break-words">Not signed in. <a className="underline" href="/signin">Sign in</a></div>
                )}

                <h3 className="text-xl font-bold leading-tight">Log your FreeRice activity</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-normal">Enter correct answers (10 grains/answer) or grains directly. You must be signed in.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 whitespace-normal">Correct answers</label>
                  <input
                    type="number"
                    min={0}
                    value={answers as any}
                    onChange={(e) => setAnswers(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full max-w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent min-h-[48px] min-w-0 overflow-visible"
                    placeholder="Number of correct answers"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 whitespace-normal">Or: Grains</label>
                  <input
                    type="number"
                    min={0}
                    value={grains as any}
                    onChange={(e) => setGrains(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full max-w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent min-h-[48px] min-w-0 overflow-visible"
                    placeholder="Number of grains"
                  />
                </div>

                <button
                  style={{ backgroundImage: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)' }}
                  className="w-full mt-2 px-4 py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-95 border border-transparent"
                  type="submit"
                >
                  Log donation
                </button>

                {message && <div className="mt-3 text-sm text-center text-[#623100] whitespace-normal break-words">{message}</div>}
              </form>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">Thank you for supporting FreeRice and our mission.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
