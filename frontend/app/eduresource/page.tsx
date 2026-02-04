// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
'use client';

type ResourceProps = {
  name: string;
  description: string;
  url: string;
  variant?: 'cyan' | 'yellow' | 'orange';
};

export default function EducationalResources() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6 md:px-10">
        <header className="text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Educational Resources
          </h1>

          <p className="mx-auto mt-4 max-w-5xl text-left text-xl leading-relaxed text-[color:var(--color-gray-dark)] sm:text-2xl">
            Educational resources on poverty will provide you the knowledge, data, and research to
            deepen your understanding of global and local inequality.
          </p>
        </header>

        <div className="mt-10 text-[1.05rem] sm:text-[1.1rem] leading-relaxed">
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ResourceCard
              name="United Nations Children’s Fund"
              url="https://www.unicef.org/"
              description="UNICEF is a major United Nations agency committed to protecting the rights and well-being of children around the world, with poverty reduction as a main pillar."
              variant="cyan"
            />
            <ResourceCard
              name="Innovations for Poverty Action (IPA)"
              url="https://www.poverty-action.org/"
              description="Innovations of Poverty Action (IPA) is a research-and-policy nonprofit that aims to find evidence on what methods have and have not been working in global poverty reduction."
              variant="yellow"
            />
            <ResourceCard
              name="Data & Evidence to End Extreme Poverty (DEEP)"
              url="https://www.deepglobal.org/"
              description="DEEP is a global consortium dedicated to improving how poverty is understood and addressed by improving data, analysis, and evidence."
              variant="orange"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function ResourceCard({ name, description, url, variant = 'cyan' }: ResourceProps) {
  const borderClass =
    variant === 'yellow'
      ? 'card-yellow'
      : variant === 'orange'
      ? 'card-orange'
      : 'card-cyan';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card ${borderClass} group block h-full min-h-[260px] flex flex-col transition-transform hover:scale-[1.01]`}
      style={{ background: 'white', borderWidth: 2 }}
    >
      {/* FIXED HEADER BLOCK */}
      <div className="min-h-[72px] flex items-start justify-between gap-3">
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {name}
        </h3>
        <span
          aria-hidden
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-gray-light)] text-[color:var(--color-gray-dark)] shadow-[var(--shadow-sm)] transition-transform group-hover:-translate-y-0.5 group-hover:scale-[1.05]"
        >
          ↗
        </span>
      </div>

      <p className="mt-3 text-base leading-relaxed text-[color:var(--color-gray-dark)] sm:text-lg">
        {description}
      </p>

      <p className="mt-auto pt-4 text-base font-semibold text-[color:var(--color-secondary)] underline underline-offset-4 group-hover:text-[color:var(--color-secondary-hover)] sm:text-lg">
        Visit site
      </p>
    </a>
  );
}