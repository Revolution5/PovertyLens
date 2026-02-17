// Done by Christella - 12/08/2025
// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
// UI updated to use globals.css design system - Edited by Christella Taguicana - 02/17/2026
'use client';

import Link from 'next/link'; // Added on 02/04/2026 by Christella to connect PLdonation page

type OrgCardProps = {
  // Edited by Christella - 02/05/2026
  name: string;
  description: string;
  url: string; // external (https://...) OR internal (/PLdonation)
};

// Sets the donations and volunteering resources
// Edited by Christella - 02/05/2026
export default function DonationsAndVolunteeringPage() {
  return (
    // ============== Edited by Christella Taguicana - 02/17/2026 ==============
    // Replaced hardcoded hex colors with globals.css CSS variables for dark mode support
    // and consistent theming across the app
    <main
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '40px 80px 80px',
        color: 'var(--foreground)',
        transition: 'background-color var(--transition-base), color var(--transition-base)',
      }}
    >
      {/* ---- Page Header ---- */}
      {/* ============== Edited by Christella Taguicana - 02/17/2026 ==============
          Updated header: matched font size to dashboard (text-4xl sm:text-5xl),
          left-aligned with paddingLeft to sit flush with card grid,
          and added decorative cyan-yellow divider bar */}
      <header style={{ marginBottom: 40, paddingLeft: 24 }}>
        <h1
          className="text-4xl sm:text-5xl font-bold"
          style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}
        >
          Donations &amp; Volunteering
        </h1>

        {/* Decorative divider — uses brand gradient from globals.css
            Added by Christella Taguicana - 02/17/2026 */}
        <div
          style={{
            height: 4,
            width: 80,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-cyan-yellow)',
            margin: '0 0 24px 0',
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.7,
            color: 'var(--color-gray-dark)',
          }}
        >
          We built PovertyLens to make action accessible from anywhere. That means your impact
          shouldn&apos;t be based solely on your zip code. The organizations provided are verified
          platforms where you donate financially or volunteer hands-on to combat poverty.
        </p>
      </header>

      {/* ---- DONATIONS SECTION ---- */}
      {/* ============== Edited by Christella Taguicana - 02/17/2026 ==============
          Restructured layout: aside (1.2fr) on the left, cards (3fr) on the right.
          Mirrors the volunteering section's structure but flipped, for visual consistency. */}
      <section
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: '1.2fr 3fr',
          alignItems: 'stretch',
          marginBottom: 60,
        }}
      >
        {/* Donations aside — styled to match the volunteering aside
            Edited by Christella Taguicana - 02/17/2026 */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: 'var(--foreground)', margin: 0 }}
          >
            Donations
          </h2>

          {/* Decorative divider using cyan-yellow gradient to distinguish from volunteering's orange-red
              Added by Christella Taguicana - 02/17/2026 */}
          <div
            style={{
              height: 4,
              width: 60,
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-cyan-yellow)',
            }}
          />

          <p
            style={{
              maxWidth: 340,
              fontSize: 18,
              lineHeight: 1.7,
              color: 'var(--color-gray-dark)',
              margin: 0,
            }}
          >
            The organizations shown here are focused on effective, evidence-based giving. These
            groups ensure your money is making the best possible difference.
          </p>
        </aside>

        {/* Donation Cards grid — 2 columns, equal height cards
            Edited by Christella Taguicana - 02/17/2026: added color variants (cyan, yellow, orange, red)
            to match volunteering card styling */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
            gap: 22,
            alignItems: 'stretch',
          }}
        >
          <Card
            name="CARE"
            url="https://www.care.org/"
            variant="cyan" // Edited by Christella Taguicana - 02/17/2026: added variant
            description="CARE is a major international humanitarian organiztion dedicated to fighting global poverty and achieving social justice. They aim to empower women and girls to fight poverty. Donating to CARE would be an investment to long-term solutions, such as emergency aid, economic growth, and health and education programs."
          />
          <Card
            name="GiveDirectly"
            url="https://www.givedirectly.org/"
            variant="yellow" // Edited by Christella Taguicana - 02/17/2026: added variant
            description="GiveDirectly is non-profit organization that direct-transfers cash with no strings attached, to people in extreme poverty. Donating to GiveDirectly is a proven, highly-efficient method of aid, as recipients use the cash for their most pressing needs, such as medicine, education, or business investments, with a large percentage of every dollar going straight to the families."
          />
          <Card
            name="Oxfam America"
            url="https://www.oxfamamerica.org/"
            variant="orange" // Edited by Christella Taguicana - 02/17/2026: added variant
            description="Oxfam aims to fight poverty and injustice by tackling the root causes of inequality, providing emergency aid, and campaigning for economic, gender, and climate justice. Donations to this organization would support a powerful movement that provides both immediate relief in crises and long-term systemic change to ensure everyone has equal rights and can thrive."
          />
          {/* Internal navigation to your donation route */}
          <Card
            name="PovertyLens"
            url="/PLdonation" // Edited by Christella - 02/05/2026
            variant="red" // Edited by Christella Taguicana - 02/17/2026: added variant
            description="PovertyLens is a centralized platform that aims to inform the public about the complexities of poverty. The donations would support our mission of education and awareness, while also supporting other humanitarian groups like the Red Cross for emergency relief and aid, and direct poverty interventions for long-term solutions."
          />
        </div>
      </section>

      {/* Divider between Donations and Volunteering sections
          Edited by Christella Taguicana - 02/17/2026: replaced Tailwind className with inline style for consistency */}
      <div
        style={{
          height: 1,
          background: 'rgba(0,0,0,0.12)',
          margin: '0 0 60px 0',
        }}
      />

      {/* ================= VOLUNTEERING ================= */}
      {/* ============== Edited by Christella Taguicana - 02/17/2026 ==============
          Restructured layout: cards (3fr) on the left, aside (1.2fr) on the right.
          Converted from Tailwind className grid to inline style grid for consistency. */}
      <section
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: '3fr 1.2fr',
          alignItems: 'stretch',
        }}
      >
        {/* Volunteering Cards grid — 2 columns, equal height cards
            Edited by Christella Taguicana - 02/17/2026: converted from Tailwind to inline styles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
            gap: 22,
            alignItems: 'stretch',
          }}
        >
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

        {/* Volunteering aside — centered text panel matching donations aside structure
            Edited by Christella Taguicana - 02/17/2026: converted from Tailwind className to inline styles */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: 'var(--foreground)', margin: 0 }}
          >
            Volunteering
          </h2>

          {/* Decorative divider — uses orange-red gradient to distinguish from donations' cyan-yellow
              Edited by Christella Taguicana - 02/17/2026 */}
          <div
            style={{
              height: 4,
              width: 60,
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-orange-red)',
            }}
          />

          <p
            style={{
              maxWidth: 340,
              fontSize: 18,
              lineHeight: 1.7,
              color: 'var(--color-gray-dark)',
              margin: 0,
            }}
          >
            Not everyone can volunteer on-site. These organizations specialize in virtual,
            remote, or skills-based opportunities you can do from anywhere.
          </p>
          <p
            style={{
              maxWidth: 340,
              fontSize: 18,
              lineHeight: 1.7,
              color: 'var(--color-gray-dark)',
              margin: 0,
            }}
          >
            Poverty doesn&apos;t stop at borders — and neither should our efforts.
          </p>
        </aside>
      </section>
    </main>
  );
}

/* ---------------- Card component ----------------
   Edited by Christella Taguicana - 02/17/2026:
   - Replaced hardcoded colors with globals.css CSS variables
   - Added colored accent bar at top using the card's variant color
   - Added ↗ link indicator icon in the header row
   - Added "Visit site" / "Coming soon" footer with a divider
   - Cards now use globals.css `.card` and `.card-*` classes for
     hover lift, shadow, and border color
*/

function Card({
  name,
  description,
  url,
  variant = 'cyan',
}: OrgCardProps & { variant?: 'cyan' | 'yellow' | 'orange' | 'red' }) {
  // Maps variant name to the corresponding globals.css border class
  // Edited by Christella Taguicana - 02/17/2026
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
      // globals.css `.card` handles border-radius, padding, shadow, and hover lift
      // `.card-*` handles the colored border — Edited by Christella Taguicana - 02/17/2026
      className={`card ${borderClass} group`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        backgroundColor: 'var(--background)', // respects dark mode
        borderWidth: 2,
        textDecoration: 'none',
        color: 'var(--foreground)',
        cursor: url ? 'pointer' : 'default',
      }}
    >
      {/* Colored accent bar at top — color matches the card's variant
          Added by Christella Taguicana - 02/17/2026 */}
      <div
        style={{
          height: 4,
          borderRadius: 'var(--radius-full)',
          marginBottom: 14,
          background: `var(--color-${variant})`,
        }}
      />

      {/* Header row: card title + ↗ link indicator
          Added by Christella Taguicana - 02/17/2026 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, minHeight: 60 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--foreground)',
          }}
        >
          {name}
        </h3>
        {/* ↗ icon only shown when the card has a valid URL
            Added by Christella Taguicana - 02/17/2026 */}
        {url && (
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-gray-light)',
              color: 'var(--color-gray-dark)',
              boxShadow: 'var(--shadow-sm)',
              fontSize: 14,
              transition: 'transform var(--transition-fast)',
            }}
          >
            ↗
          </span>
        )}
      </div>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: 15,
          lineHeight: 1.65,
          color: 'var(--color-gray-dark)',
          flexGrow: 1,
        }}
      >
        {description}
      </p>

      {/* Footer: shows "Visit site" if URL exists, otherwise "Coming soon"
          Added by Christella Taguicana - 02/17/2026 */}
      {url ? (
        <p
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--color-gray-light)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-secondary)',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Visit site
        </p>
      ) : (
        <p
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--color-gray-light)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-gray)',
          }}
        >
          Coming soon
        </p>
      )}
    </a>
  );
}