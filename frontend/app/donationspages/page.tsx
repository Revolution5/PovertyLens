'use client';

import Link from 'next/link';

type OrgCardProps = {
  name: string;
  description: string;
  url: string; // external (https://...) OR internal (/PLdonation)
};

const cardBg = '#D7C6B4';
const cardHover = '#c9956e';
const textBrown = '#623100';
const pageBg = '#ffffff';

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
            url="/PLdonation"
            description="PovertyLens is a centralized platform that aims to inform the public about the complexities of poverty. The donations would support our mission of education and awareness, while also supporting other humanitarian groups like the Red Cross for emergency relief and aid, and direct poverty interventions for long-term solutions."
          />
        </div>
      </section>

      {/* ---- VOLUNTEERING SECTION ---- */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.1fr',
          gap: 26,
          alignItems: 'flex-start',
          paddingTop: 30,
          borderTop: '2px solid rgba(0,0,0,0.15)',
        }}
      >
        {/* Volunteering org cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0px,1fr))',
            gap: 22,
          }}
        >
          <Card
            name="United Nations Volunteers"
            url="https://www.unv.org/"
            description="UNV is a global program that connects volunteers with organizations working to advance sustainable development and fight poverty worldwide. They empower individuals to make a difference through their support of many initiatives, including education and gender equality. Volunteering with them will promote inclusive growth in developing communities."
          />

          <Card
            name="Catchafire"
            url="https://www.catchafire.org/"
            description="Catchafire is a virtual volunteering program that links professionals with nonprofits to address social and economic challenges. By offering expertise in marketing, finance, technology, and more, volunteers can help empower nonprofits to operate more efficiently and expand their work worldwide."
          />
          <Card
            name="Translators Without Borders"
            url="https://translatorswithoutborder.org/"
            description="Translators without Borders (TWB) is a nonprofit organization that provides language and translation support to humanitarian and development organizations around the world. Volunteers can break communication barriers so all people in crisis and poverty can access necessities, and imperative information about health, education, and safety."
          />
          <Card
            name="Humanity for Relief & Development"
            url="https://hrdglobal.org/"
            description="Humanity for Relief & Development is an international nonprofit dedicaed to combating hunger and poverty. Their virtual volunteering program allows people to contribute through fundraising, outreach, digital content creation, and program support."
          />
        </div>

        {/* Right text block */}
        <div>
          <h2 style={{ fontSize: 60, fontWeight: 800, margin: '0 0 10px 0' }}>Volunteering</h2>
          <p style={{ fontSize: 32, lineHeight: 1.6, marginBottom: 12 }}>
            We understand that not everyone can commit to on-site or has a local chapter nearby. The
            organizations to the left specialize in virtual, remote, or skills-based volunteering
            that you can do from your laptop, anywhere around the world.
          </p>
          <p style={{ fontSize: 32, lineHeight: 1.6 }}>
            Poverty doesn&apos;t stop at borders, and neither should our efforts.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ---- Card component ---- */
function Card({ name, description, url }: OrgCardProps) {
  const isInternal = url.startsWith('/');

  const baseStyle: React.CSSProperties = {
    display: 'block',
    backgroundColor: cardBg,
    borderRadius: 8,
    padding: '14px 16px',
    textDecoration: 'none',
    color: textBrown,
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
  };

  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = cardHover;
    (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
  };

  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = cardBg;
    (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
  };

  if (isInternal) {
    return (
      <Link href={url} style={baseStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: 30, fontWeight: 700 }}>{name}</h3>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>{description}</p>
      </Link>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={baseStyle}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: 30, fontWeight: 700 }}>{name}</h3>
      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>{description}</p>
    </a>
  );
}
