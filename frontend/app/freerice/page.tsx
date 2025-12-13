import Link from 'next/link'
import Image from 'next/image'

export default function FreeRicePage() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] px-4 md:px-8 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Top header: centered page title */}
        <header className="flex items-center justify-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#623100] text-center">
            Play FreeRice!
          </h1>
        </header>

        {/* Main content: three equal columns (logo left, info center, leaderboard right) */}
        <main className="flex flex-col lg:flex-row lg:justify-between items-start gap-2 lg:gap-30">
          {/* Left: large logo + play button */}
          <div className="mx-auto lg:mx-0 lg:w-[409px] h-[547px] flex flex-col items-center gap-4 justify-start pt-12 lg:pt-16">
            <Image src="/WFP-trans.png" alt="WFP" width={460} height={460} className="object-contain rounded-md shadow-sm -mt-16 lg:-mt-20 mx-auto w-96 h-96 md:w-[380px] md:h-[380px] lg:w-[460px] lg:h-[460px]" />
            <a href="https://freerice.com/" target="_blank" rel="noopener noreferrer" className="mt-4 px-8 md:px-10 py-3 md:py-3 bg-[#AC7F5E] text-[#623100] rounded-lg hover:bg-[#C9956E] transition-colors font-semibold text-xl md:text-2xl lg:text-3xl">Play now</a>
          </div>

          {/* Center: description box */}
          <section className="mx-auto lg:mx-0 lg:w-[409px] h-[547px] flex">
            <div className="bg-[#D9D1B7] border border-[#AC7F5E] rounded-lg p-8 w-full h-full flex flex-col">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#623100] text-center mb-4">FreeRice: What is it?</h2>
              <p className="text-lg md:text-l leading-relaxed text-justify text-[#623100] mb-4 flex-grow">
                FreeRice is owned by the U.N. World Food Programme (WFP). For every correct answer in the trivia games, a private sponsor will pay cash equivalent to 10 grains of rice to the WFP. This model supports the WFP’s global emergency relief and hunger programs.

Answer questions, learn some new facts, compete with your friends, and have fun!
              </p>

              <div className="mt-auto">
                <p className="text-sm text-[#623100]/90">Click the Play button on the left to open FreeRice in a new tab and start answering questions.</p>
              </div>
            </div>
          </section>

          {/* Right: large leaderboard box */}
          <aside className="mx-auto lg:mx-0 lg:w-[409px] h-[547px] flex">
            <div className="bg-[#D9D1B7] border border-[#AC7F5E] rounded-lg p-8 w-full h-full overflow-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#623100] text-center mb-4">FreeRice Leaderboard</h2>
              <p className="text-base md:text-lg text-[#623100]/90">Top players and recent activity will appear here.</p>
              <ul className="mt-6 space-y-3 text-[#623100] text-base md:text-lg">
                <li className="font-semibold">1. PlayerOne — 12,340</li>
                <li className="font-semibold">2. PlayerTwo — 11,900</li>
                <li className="font-semibold">3. PlayerThree — 10,500</li>
                <li className="font-semibold">4. PlayerFour — 9,800</li>
                <li className="font-semibold">5. PlayerFive — 8,700</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}


