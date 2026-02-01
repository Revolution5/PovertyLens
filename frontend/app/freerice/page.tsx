import Link from 'next/link'
import Image from 'next/image'
import FreeRiceLeaderboardClient from '../../components/FreeRiceLeaderboardClient'
import FreeRiceRecent from '../../components/FreeRiceRecent'

export default function FreeRicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-br from-[#8CE4FF]/10 via-white to-[#FEEE91]/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">FreeRice — Play for Rice</h1>
          <p className="text-lg font-semibold max-w-2xl mx-auto mb-4 text-gray-700">Answer quick trivia. Earn grains. Help provide rice worldwide.</p>
        </div> 
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10 flex flex-col items-center gap-4">
            <Image src="/WFP-trans.png" alt="WFP" width={260} height={260} className="object-contain rounded-md" />
            <a href="https://freerice.com/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-[#FFA239] to-[#FF5656] text-white rounded-lg font-semibold shadow-md hover:opacity-95">Play now</a>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FEEE91]/30">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">How it helps</h3>
            <p className="mt-3 text-sm text-gray-700">Short summary:</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li><strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Education:</strong> Learn as you play</li>
              <li><strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Donation:</strong> Sponsors convert correct answers to rice</li>
              <li><strong className="bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Transparency:</strong> We log and display donations</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">Community Impact</h3>
            <p className="mt-3 text-sm text-gray-700">See the leaderboard and recent donations to understand our collective contribution. Small actions add up.</p>
          </div>

          <div>
            <FreeRiceRecent />
          </div>
        </div>

        {/* Center + Right: Leaderboard + Donation Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#8CE4FF]/10">
            <FreeRiceLeaderboardClient showRecent={false} />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FEEE91]/30">
            <h3 className="text-lg font-bold">Want more ways to help?</h3>
            <p className="mt-3 text-sm text-gray-700">Visit our <Link href="/donationspages" className="underline">Donations & Volunteer</Link> page to explore verified organizations and volunteer opportunities.</p>
          </div>
        </div>
      </main>
    </div>
  )
}


