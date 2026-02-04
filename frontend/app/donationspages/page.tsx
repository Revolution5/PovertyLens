// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
'use client';

type OrgCardProps = {
  name: string;
  description: string;
  url: string;
};

export default function DonationsAndVolunteeringPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6 md:px-10">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Donations &amp; Volunteering
          </h1>

          <p className="mx-auto mt-4 max-w-5xl text-left text-xl leading-relaxed text-[color:var(--color-gray-dark)] sm:text-2xl">
            We built PovertyLens to make action accessible from anywhere. That means your impact
            shouldn&apos;t be based solely on your zip code. The organizations provided are verified
            platforms where you can donate financially or volunteer hands-on to combat poverty.
          </p>
        </header>

        {/* Body scale wrapper */}
        <div className="mt-10 text-[1.05rem] sm:text-[1.1rem] leading-relaxed">
          {/* ================= DONATIONS ================= */}
          <section className="grid gap-6 lg:grid-cols-[1.2fr_3fr] lg:items-stretch">
            {/* Donations description */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--gradient-light)] p-6 text-center shadow-[var(--shadow-sm)]">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Donations
              </h2>
              <p className="max-w-md text-lg text-[color:var(--color-gray-dark)] sm:text-xl">
                These organizations focus on effective, evidence-based giving to ensure your
                contributions make a real impact.
              </p>
            </div>

            {/* Donation cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card
                name="CARE"
                url="https://www.care.org/"
                description="CARE is an international humanitarian organization fighting global poverty and social injustice. Their programs focus on empowering women and girls, emergency aid, education, health, and economic development."
                variant="cyan"
              />
              <Card
                name="GiveDirectly"
                url="https://www.givedirectly.org/"
                description="GiveDirectly provides direct cash transfers to people living in extreme poverty. This proven approach allows recipients to address their most urgent needs efficiently."
                variant="yellow"
              />
              <Card
                name="Oxfam America"
                url="https://www.oxfamamerica.org/"
                description="Oxfam tackles the root causes of poverty and inequality by providing emergency aid and advocating for systemic economic, gender, and climate justice."
                variant="orange"
              />
              <Card
                name="PovertyLens"
                url=""
                description="PovertyLens is a centralized platform focused on education and awareness about poverty. Donations support humanitarian aid partnerships and long-term solutions."
                variant="red"
              />
            </div>
          </section>

          {/* Divider */}
          <div className="my-10 h-px w-full bg-[color:rgba(0,0,0,0.12)]" />

          {/* ================= VOLUNTEERING ================= */}
          <section className="grid gap-6 lg:grid-cols-[3fr_1.2fr] lg:items-stretch">
            {/* Volunteering cards — THIS IS WHAT WAS MISSING */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card
                name="United Nations Volunteers"
                url="https://www.unv.org/"
                description="UNV connects volunteers with organizations advancing sustainable development worldwide, supporting education, gender equality, and poverty reduction."
                variant="cyan"
              />
              <Card
                name="Catchafire"
                url="https://www.catchafire.org/"
                description="Catchafire links skilled professionals with nonprofits through virtual volunteering opportunities in marketing, finance, technology, and more."
                variant="yellow"
              />
              <Card
                name="Translators Without Borders"
                url="https://translatorswithoutborder.org/"
                description="This organization provides translation support to humanitarian groups so critical information reaches people in crisis regardless of language."
                variant="orange"
              />
              <Card
                name="Humanity for Relief & Development"
                url="https://hrdglobal.org/"
                description="HRD combats hunger and poverty globally, offering virtual volunteering opportunities in outreach, fundraising, and program support."
                variant="red"
              />
            </div>

            {/* Volunteering description */}
            <aside className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] bg-[var(--gradient-light)] p-6 text-center shadow-[var(--shadow-sm)]">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Volunteering
              </h2>
              <p className="max-w-md text-lg text-[color:var(--color-gray-dark)] sm:text-xl">
                Not everyone can volunteer on-site. These organizations specialize in virtual,
                remote, or skills-based opportunities you can do from anywhere.
              </p>
              <p className="max-w-md text-lg text-[color:var(--color-gray-dark)] sm:text-xl">
                Poverty doesn&apos;t stop at borders — and neither should our efforts.
              </p>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Card component ---------------- */

function Card({
  name,
  description,
  url,
  variant = 'cyan',
}: OrgCardProps & { variant?: 'cyan' | 'yellow' | 'orange' | 'red' }) {
  const borderClass =
    variant === 'yellow'
      ? 'card-yellow'
      : variant === 'orange'
      ? 'card-orange'
      : variant === 'red'
      ? 'card-red'
      : 'card-cyan';

  return (
    <a
      href={url || undefined}
      target={url ? '_blank' : undefined}
      rel={url ? 'noopener noreferrer' : undefined}
      className={`card ${borderClass} group block h-full flex flex-col transition-transform ${
        url ? 'hover:scale-[1.01]' : 'cursor-default'
      }`}
      style={{ background: 'white', borderWidth: 2 }}
    >
      {/* Fixed header block for alignment */}
      <div className="min-h-[72px] flex items-start justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {name}
        </h3>
        {url && (
          <span
            aria-hidden
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-light)] text-[color:var(--color-gray-dark)] shadow-[var(--shadow-sm)] transition-transform group-hover:-translate-y-0.5 group-hover:scale-[1.05]"
          >
            ↗
          </span>
        )}
      </div>

      <p className="mt-3 text-base leading-relaxed text-[color:var(--color-gray-dark)] sm:text-lg">
        {description}
      </p>

      {url ? (
        <p className="mt-auto pt-4 text-base font-semibold text-[color:var(--color-secondary)] underline underline-offset-4 group-hover:text-[color:var(--color-secondary-hover)] sm:text-lg">
          Visit site
        </p>
      ) : (
        <p className="mt-auto pt-4 text-base font-semibold text-[color:var(--color-gray)] sm:text-lg">
          Coming soon
        </p>
      )}
    </a>
  );
}