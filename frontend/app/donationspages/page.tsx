// Done by Christella - 12/08/2025
// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
// UI updated to use globals.css design system - Edited by Christella Taguicana - 02/17/2026
'use client';

import { useEffect, useState } from 'react';

type OrgCardProps = {
  name: string;
  description: string;
  url: string;
  // ============== Added by Christella Taguicana - 02/17/2026: Added variants for border styling consistency ==============
  variant?: 'cyan' | 'yellow' | 'orange' | 'red';
};

export default function DonationsAndVolunteeringPage() {
  // ============== Added by Christella Taguicana - 02/17/2026 ==============
  // Favorites state (copied behavior from Educational Resources: per-user via localStorage)
  const [favorites, setFavorites] = useState<Array<{ name: string; url: string }>>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    if (email) {
      const favoritesKey = `favoriteResources_${email}`;
      const storedFavorites = localStorage.getItem(favoritesKey);
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (resourceName: string, resourceUrl: string) => {
    if (!userEmail) return;

    setFavorites((prev) => {
      let newFavorites;
      const existingIndex = prev.findIndex((fav) => fav.url === resourceUrl);

      if (existingIndex !== -1) {
        newFavorites = prev.filter((_, index) => index !== existingIndex);
      } else {
        newFavorites = [...prev, { name: resourceName, url: resourceUrl }];
      }

      const favoritesKey = `favoriteResources_${userEmail}`;
      localStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };
  // ============== End Added by Christella Taguicana - 02/17/2026 ==============

  return (
    <main
      style={{
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        padding: '40px 80px 80px',
        color: 'var(--foreground)',
      }}
    >
      {/* 
        ============== Added by Christella Taguicana - 02/17/2026 ==============
        Dark mode outline opacity override for bento cards:
      */}
      <style>{`
        .dark .card-cyan   { border-color: rgba(140, 228, 255, 0.22) !important; }
        .dark .card-yellow { border-color: rgba(254, 238, 145, 0.22) !important; }
        .dark .card-orange { border-color: rgba(255, 162, 57,  0.22) !important; }
        .dark .card-red    { border-color: rgba(255, 86,  86,  0.22) !important; }

        /* Accent bars should stay a little stronger than outlines */
        .dark .accent-bar-cyan   { background: rgba(140, 228, 255, 0.35) !important; }
        .dark .accent-bar-yellow { background: rgba(245, 213, 71, 0.45) !important; }
        .dark .accent-bar-orange { background: rgba(255, 162, 57,  0.35) !important; }
        .dark .accent-bar-red    { background: rgba(255, 86,  86,  0.35) !important; }
      `}</style>

      {/* ============== Added by Christella Taguicana - 02/17/2026 ==============
          Aligns header + intro bars + bento cards to the same left/right inset, so spacing is equal and consistent across the page. 
      */}
      <div style={{ paddingLeft: 24, paddingRight: 24 }}>
        {/* ---- Page Header ---- */}
        <header style={{ marginBottom: 40 }}>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}
          >
            Donations &amp; Volunteering
          </h1>

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

        {/* ================= DONATIONS INTRO BAR ================= */}
        <SectionIntroBar
          title="Donations"
          dividerGradient="var(--gradient-orange-red)"
          description="The organizations shown here are focused on effective, evidence-based giving. These groups ensure your money is making the best possible difference."
        />

        {/* ================= DONATIONS BENTO ================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
            marginBottom: 60,
            alignItems: 'stretch',
          }}
        >
          {/* Big LEFT feature — Oxfam */}
          <FeatureCardWithFavorite
            name="Oxfam America"
            url="https://www.oxfamamerica.org/"
            variant="orange"
            imageSrc="/oxfam-logo-v2.jpg"
            description="Oxfam aims to fight poverty and injustice by tackling the root causes of inequality, providing emergency aid, and campaigning for economic, gender, and climate justice. Donations to this organization would support a powerful movement that provides both immediate relief in crises and long-term systemic change to ensure everyone has equal rights and can thrive."
            isFavorite={favorites.some((fav) => fav.url === 'https://www.oxfamamerica.org/')}
            onToggleFavorite={() => toggleFavorite('Oxfam America', 'https://www.oxfamamerica.org/')}
          />

          {/* Right stacked cards */}
          <div style={{ display: 'grid', gap: 22 }}>
            <CardWithFavorite
              name="GiveDirectly"
              url="https://www.givedirectly.org/"
              variant="yellow"
              description="GiveDirectly provides direct cash transfers to people living in extreme poverty, allowing families to use funds for urgent needs like food, healthcare, education, or small business investments."
              isFavorite={favorites.some((fav) => fav.url === 'https://www.givedirectly.org/')}
              onToggleFavorite={() => toggleFavorite('GiveDirectly', 'https://www.givedirectly.org/')}
            />
            <CardWithFavorite
              name="CARE"
              url="https://www.care.org/"
              variant="cyan"
              description="CARE is a global humanitarian organization fighting poverty and supporting women and girls through long-term solutions in health, education, and economic opportunity."
              isFavorite={favorites.some((fav) => fav.url === 'https://www.care.org/')}
              onToggleFavorite={() => toggleFavorite('CARE', 'https://www.care.org/')}
            />
            <CardWithFavorite
              name="PovertyLens"
              url="/PLdonation"
              variant="red"
              description="PovertyLens educates the public about poverty while supporting humanitarian relief and long-term development initiatives."
              isFavorite={favorites.some((fav) => fav.url === '/PLdonation')}
              onToggleFavorite={() => toggleFavorite('PovertyLens', '/PLdonation')}
            />
          </div>
        </section>

        {/* ================= VOLUNTEERING INTRO BAR ================= */}
        <SectionIntroBar
          title="Volunteering"
          dividerGradient="var(--gradient-orange-red)"
          description="Not everyone can volunteer on-site. These organizations specialize in virtual, remote, or skills-based opportunities you can do from anywhere. Poverty doesn’t stop at borders — and neither should our efforts."
        />

        {/* ================= VOLUNTEERING BENTO ================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
          }}
        >
          {/* Left stacked cards */}
          <div style={{ display: 'grid', gap: 22 }}>
            <CardWithFavorite
              name="Catchafire"
              url="https://www.catchafire.org/"
              variant="yellow"
              description="Catchafire connects skilled professionals with nonprofits for remote, skills-based projects—like design, marketing, finance, data, and technology—so organizations can grow their impact efficiently."
              isFavorite={favorites.some((fav) => fav.url === 'https://www.catchafire.org/')}
              onToggleFavorite={() => toggleFavorite('Catchafire', 'https://www.catchafire.org/')}
            />
            <CardWithFavorite
              name="Translators Without Borders"
              url="https://translatorswithoutborder.org/"
              variant="orange"
              description="Translators Without Borders supports humanitarian organizations by translating critical information so communities can access health, safety, and crisis resources in languages they understand."
              isFavorite={favorites.some((fav) => fav.url === 'https://translatorswithoutborder.org/')}
              onToggleFavorite={() =>
                toggleFavorite('Translators Without Borders', 'https://translatorswithoutborder.org/')
              }
            />
            <CardWithFavorite
              name="Humanity for Relief & Development"
              url="https://hrdglobal.org/"
              variant="red"
              description="HRD works to reduce hunger and poverty through relief and development programs, and offers virtual volunteer roles in outreach, fundraising, communications, and program support."
              isFavorite={favorites.some((fav) => fav.url === 'https://hrdglobal.org/')}
              onToggleFavorite={() =>
                toggleFavorite('Humanity for Relief & Development', 'https://hrdglobal.org/')
              }
            />
          </div>

          {/* Big RIGHT feature — UN Volunteers */}
          <FeatureCardWithFavorite
            name="United Nations Volunteers"
            url="https://www.unv.org/"
            variant="cyan"
            imageSrc="/unv-logo-v2.png"
            description="United Nations Volunteers (UNV) advances peace and development by mobilizing volunteers to support sustainable development initiatives worldwide. Through partnerships with governments, UN agencies, and local organizations, UNV places skilled volunteers in programs focused on poverty reduction, education, gender equality, climate action, and humanitarian response. By strengthening community-led efforts and building long-term institutional capacity, UNV helps create lasting, inclusive change that supports vulnerable populations and promotes equitable global development."
            isFavorite={favorites.some((fav) => fav.url === 'https://www.unv.org/')}
            onToggleFavorite={() => toggleFavorite('United Nations Volunteers', 'https://www.unv.org/')}
          />
        </section>

        {/* ================= DISCLAIMER ================= */}
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-gray)',
            marginTop: 60,
            textAlign: 'center',
          }}
        >
          Organization names and logos are trademarks of their respective owners and are used for informational purposes only.
        </p>
      </div>
    </main>
  );
}

/* ================= SECTION INTRO BAR ================= */
function SectionIntroBar({
  title,
  description,
  dividerGradient,
}: {
  title: string;
  description: string;
  dividerGradient: string;
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 className="text-3xl font-bold" style={{ margin: 0 }}>
        {title}
      </h2>

      <div
        style={{
          height: 4,
          width: 80,
          borderRadius: 'var(--radius-full)',
          background: dividerGradient,
          margin: '12px 0',
        }}
      />

      <p
        style={{
          margin: 0,
          fontSize: 18,
          lineHeight: 1.7,
          color: 'var(--color-gray-dark)',
        }}
      >
        {description}
      </p>
    </section>
  );
}

/* ================= FAVORITE BUTTON WRAPPER ================= */
function FavoriteWrapper({
  isFavorite,
  onToggleFavorite,
  children,
}: {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'var(--background)',
          border: '1.5px solid rgba(0,0,0,0.08)',
          borderRadius: 'var(--radius-full)',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        }}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isFavorite ? 'var(--color-yellow)' : 'none'}
          stroke={isFavorite ? 'var(--color-orange)' : 'var(--color-gray)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'fill var(--transition-fast), stroke var(--transition-fast)' }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>

      {children}
    </div>
  );
}

/* ================= FEATURE CARD (WITH FAVORITE) ================= */
function FeatureCardWithFavorite({
  name,
  description,
  url,
  variant,
  imageSrc,
  isFavorite,
  onToggleFavorite,
}: OrgCardProps & {
  variant: 'cyan' | 'yellow' | 'orange' | 'red';
  imageSrc: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <FavoriteWrapper isFavorite={isFavorite} onToggleFavorite={onToggleFavorite}>
      <FeatureCard name={name} description={description} url={url} variant={variant} imageSrc={imageSrc} />
    </FavoriteWrapper>
  );
}

/* ================= SMALL CARD (WITH FAVORITE) ================= */
function CardWithFavorite({
  name,
  description,
  url,
  variant = 'cyan',
  isFavorite,
  onToggleFavorite,
}: OrgCardProps & {
  variant: 'cyan' | 'yellow' | 'orange' | 'red';
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <FavoriteWrapper isFavorite={isFavorite} onToggleFavorite={onToggleFavorite}>
      <Card name={name} description={description} url={url} variant={variant} />
    </FavoriteWrapper>
  );
}

/* ================= FEATURE CARD ================= */
function FeatureCard({
  name,
  description,
  url,
  variant,
  imageSrc,
}: OrgCardProps & {
  variant: 'cyan' | 'yellow' | 'orange' | 'red';
  imageSrc: string;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const tintBg =
    variant === 'cyan'
      ? '#E5F8FF'
      : variant === 'yellow'
      ? '#FFFCEB'
      : variant === 'orange'
      ? '#FFE8D6'
      : '#FFE5E5';

  const accent =
    variant === 'cyan'
      ? 'var(--color-cyan)'
      : variant === 'yellow'
      ? 'var(--color-yellow)'
      : variant === 'orange'
      ? 'var(--color-orange)'
      : 'var(--color-red)';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card card-${variant}`}
      style={{
        backgroundColor: isDark ? 'transparent' : tintBg,
        borderColor: isDark ? '' : 'transparent',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDark ? '' : 'transparent')}
    >
      <div
        style={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-light)',
        }}
      >
        <img
          src={imageSrc}
          alt={`${name} logo`}
          style={{
            width: '92%',
            height: '85%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, }}>
        <div
          className={`accent-bar-${variant}`}
          style={{
            height: 4,
            borderRadius: 'var(--radius-full)',
            marginBottom: 16,
            background: accent,
          }}
        />
        <h3 style={{ fontSize: 22, fontWeight: 700 }}>{name}</h3>
        <p style={{ marginTop: 10 }}>{description}</p>

        <p
          style={{
            marginTop: 'auto',
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
      </div>
    </a>
  );
}

/* ================= SMALL CARD ================= */
function Card({
  name,
  description,
  url,
  variant = 'cyan',
}: OrgCardProps & { variant?: 'cyan' | 'yellow' | 'orange' | 'red' }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const tintBg =
    variant === 'cyan'
      ? '#E5F8FF'
      : variant === 'yellow'
      ? '#FFFCEB'
      : variant === 'orange'
      ? '#FFE8D6'
      : '#FFE5E5';

  const accent =
    variant === 'cyan'
      ? 'var(--color-cyan)'
      : variant === 'yellow'
      ? 'var(--color-yellow)'
      : variant === 'orange'
      ? 'var(--color-orange)'
      : 'var(--color-red)';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card card-${variant}`}
      style={{
        backgroundColor: isDark ? 'transparent' : tintBg,
        borderColor: isDark ? '' : 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = isDark ? '' : 'transparent')}
    >
      <div
        className={`accent-bar-${variant}`}
        style={{
          height: 4,
          borderRadius: 'var(--radius-full)',
          marginBottom: 14,
          background: accent,
        }}
      />

      <h3 style={{ fontWeight: 700 }}>{name}</h3>
      <p style={{ marginTop: 8 }}>{description}</p>

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
    </a>
  );
}
