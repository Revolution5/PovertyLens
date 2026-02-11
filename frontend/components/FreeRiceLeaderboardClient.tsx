"use client"
//Reymes 1/31/26
// Marisol Morales - 2/9/2026 - Added dark mode support
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

  // ============== Marisol Code for Dark Mode Detection 2/9/2026 ============== //
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
  // ============== End of Marisol Code for End Dark Mode Detection 2/9/2026 ============== //

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
        setMessage('Donation logged – thank you!')
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
          <p className="mt-3 text-lg font-semibold" style={{ color: 'var(--color-gray)' }}>Log activity. See community impact.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Top Contributors */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className="p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Top Contributors</h2>
                <div className="text-sm" style={{ color: 'var(--color-gray)' }}>{top.length} entries</div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="text-center py-8" style={{ color: 'var(--color-gray)' }}>Loading leaderboard...</div>
                ) : (
                  <ol className="space-y-3">
                    {top.length === 0 && <li style={{ color: 'var(--color-gray)' }}>No donations yet. Be the first!</li>}
                    {top.map((t, i) => (
                      <li 
                        key={i} 
                        className="flex items-center justify-between p-3 rounded-lg transition-colors"
                        style={{
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
                        }}
                      >
                        <div>
                          <div className="text-sm" style={{ color: 'var(--color-gray)' }}>#{i + 1}</div>
                          <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{t.username || t.email || 'Anonymous'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">{t.totalGrains.toLocaleString()}</div>
                          <div className="text-sm" style={{ color: 'var(--color-gray)' }}>grains</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {showRecent && (
              <div 
                className="p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Recent Activity</h3>
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
              </div>
            )}
          </div>

          {/* Right: Donation form */}
          <div>
            <div 
              className="p-6 rounded-2xl shadow-sm border border-[#FEEE91]/30 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--background)' }}
            >
              <div className="mb-2">
                {sessionEmail ? (
                  <div 
                    className="mb-3 p-2 rounded text-sm whitespace-normal break-words"
                    style={{
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgb(240, 253, 244)',
                      borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgb(187, 247, 208)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      color: 'var(--foreground)'
                    }}
                  >
                    Signed in as <strong className="font-semibold">{sessionEmail}</strong>
                  </div>
                ) : (
                  <div 
                    className="mb-3 p-2 rounded text-sm whitespace-normal break-words"
                    style={{
                      backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgb(254, 252, 232)',
                      borderColor: isDark ? 'rgba(234, 179, 8, 0.4)' : 'rgb(254, 240, 138)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      color: 'var(--foreground)'
                    }}
                  >
                    Not signed in. <a className="underline" href="/signin">Sign in</a>
                  </div>
                )}

                <h3 className="text-xl font-bold leading-tight" style={{ color: 'var(--foreground)' }}>Log your FreeRice activity</h3>
                <p className="text-sm leading-relaxed whitespace-normal" style={{ color: 'var(--color-gray)' }}>Enter correct answers (10 grains/answer) or grains directly. You must be signed in.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="min-w-0">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Correct answers
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={answers as any}
                    onChange={(e) => setAnswers(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Number of correct answers"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--color-gray-light)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Or: Grains
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={grains as any}
                    onChange={(e) => setGrains(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Number of grains"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--color-gray-light)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>

                <button
                  style={{ backgroundImage: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)' }}
                  className="w-full mt-2 px-4 py-3 text-white rounded-lg font-semibold shadow-md hover:opacity-95 border border-transparent"
                  type="submit"
                >
                  Log donation
                </button>

                {message && (
                  <div 
                    className="mt-3 text-sm text-center whitespace-normal break-words"
                    style={{ color: isDark ? '#FFB660' : '#623100' }}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>

            <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-gray)' }}>Thank you for supporting FreeRice and our mission.</div>
          </div>
        </div>
      </section>
    </div>
  )
}