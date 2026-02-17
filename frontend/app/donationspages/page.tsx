// Done by Christella - 12/08/2025
// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
'use client';

import Link from 'next/link'; // Added on 02/04/2026 by Christella to connect PLdonation page

type OrgCardProps = {
  // Edited by Christella - 02/05/2026
  name: string;
  description: string;
  url: string; // external (https://...) OR internal (/PLdonation)
};

const textBrown = '#623100';
const pageBg = '#ffffff';

// Sets the donations and volunteering resources
// Edited by Christella - 02/05/2026
export default function DonationsAndVolunteeringPage() {
  return (
    <div
      style={{
        backgroundColor: pageBg,
        minHeight: '100vh',
        padding: '40px 24px 80px',
        color: textBrown,
        textAlign: 'center',
      }}
    >
      {/* Donations & Volunteering */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 90,
            fontWeight: 800,
            letterSpacing: 0.5,
            margin: 0,
          }}
        >
          Donations &amp; Volunteering
        </h1>
        <p
          style={{
            width: '100%',
            fontSize: 32,
            lineHeight: 1.4,
            marginTop: 18,
            color: textBrown,
            textAlign: 'left',
          }}
        >
          We built PovertyLens to make action accessible from anywhere. That means your impact
          shouldn&apos;t be based solely on your zip code. The organizations provided are verified
          platforms where you donate financially or volunteer hands-on to combat poverty.
        </p>
      </div>

      {/* ---- DONATIONS SECTIONS ---- */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 2fr',
          gap: 26,
          alignItems: 'flex-start',
          marginTop: 40,
          marginBottom: 70,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 60,
              fontWeight: 800,
              margin: '0 0 10px 0',
            }}
          >
            Donations
          </h2>

          {/* Left text block */}
          <p style={{ fontSize: 32, lineHeight: 1.6 }}>
            The organizations shown here are focused on effective, evidence-based giving. These
            groups ensure your money is making the best possible difference.
          </p>
        </div>

        {/* Donations Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
            gap: 22,
          }}
        >
          <Card
            name="CARE"
            url="https://www.care.org/"
            description="CARE is a major international humanitarian organiztion dedicated to fighting global poverty and achieving social justice. They aim to empower women and girls to fight poverty. Donating to CARE would be an investment to long-term solutions, such as emergency aid, economic growth, and health and education programs."
          />
          <Card
            name="GiveDirectly"
            url="https://www.givedirectly.org/"
            description="GiveDirectly is non-profit organization that direct-transfers cash with no strings attached, to people in extreme poverty. Donating to GiveDirectly is a proven, highly-efficient method of aid, as recipients use the cash for their most pressing needs, such as medicine, education, or business investments, with a large percentage of every dollar going straight to the families."
          />
          <Card
            name="Oxfam America"
            url="https://www.oxfamamerica.org/"
            description="Oxfam aims to fight poverty and injustice by tackling the root causes of inequality, providing emergency aid, and campaigning for economic, gender, and climate justice. Donations to this organization would support a powerful movement that provides both immediate relief in crises and long-term systemic change to ensure everyone has equal rights and can thrive."
          />

          {/* Internal navigation to your donation route */}
          <Card
            name="PovertyLens"
            url="/PLdonation" // Edited by Christella - 02/05/2026
            description="PovertyLens is a centralized platform that aims to inform the public about the complexities of poverty. The donations would support our mission of education and awareness, while also supporting other humanitarian groups like the Red Cross for emergency relief and aid, and direct poverty interventions for long-term solutions."
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
