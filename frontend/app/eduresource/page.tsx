'use client';

type ResourceProps = {
    name: string;
    description: string;
    url: string;
};

const cardBg = '#D7C6B4';
const cardHover = '#c9956e';
const textBrown = '#623100';
const pageBg = '#ffffff';

export default function EducationalResources(){
    return (
        <div
            style={{
                backgroundColor: pageBg,
                minHeight: '100vh',
                padding: '40px 80px 80px',
                color: textBrown,
            }}
        >
            {/* ---- Title ---- */}
            <h1
                style={{
                    fontSize: 90,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    margin: 0,
                    marginBottom: 10,
                    textAlign: 'center',
                }}
            >
                Educational Resources
            </h1>
            {/* Intro Paragraph */}
            <p style={{width: '100%', fontSize: 32, lineHeight: 1.4, marginTop: 0, marginBottom: 10, color: textBrown, textAlign: 'left'}}>
                Educational resources on poverty will provide you the knowledge, data, and research to deepen your understanding of global and local inequality. This will empower individuals and organizations to make informed decisions and provide solutions to address the root causes of poverty. Engaging with the following resources can help learners, researchers, and advocates to act with evidence-based solutions. Click one of the links below!
            </p>
            {/* Educational links */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0px, 1fr))',
                    gap: 22,
                }}
            >
                <ResourceCard
                    name="United Nations Children’s Fund"
                    url="https://www.unicef.org/"
                    description="UNICEF is a major United Nations agency committed to protecting the rights and well-being of children around the world, with poverty reduction as a main pillar. They stress that poverty is more than just low income. For children, it involves education, health, nutrition, water, and sanitation deprivation. By working with governments and communities, UNICEF advocates for long term solutions to break the cycle of poverty."
                />
                <ResourceCard
                    name="Innovations for Poverty Action (IPA)"
                    url="https://www.poverty-action.org/"
                    description="Innovations of Poverty Action (IPA) is a research-and-policy nonprofit that aims to find evidence on what methods have and have not been working in global poverty reduction. Through partnerships with researches, NGOs, governments, and sponsors, the IPA designs and evaluates interventions across many countries. They aim to inform people of high-impact poverty-reduction programs. "
                />
                <ResourceCard
                    name="Data & Evidence to End Extreme Poverty (DEEP)"
                    url="https://www.deepglobal.org/"
                    description="DEEP is a global consortium dedicated to to improving how poverty is understood and addressed by improving data, analysis, and evidence. They aim to provide governments, decision-makers, researchers, and citizens better tools and evidence to combat poverty. Through their projects, DEEP supports policies and programs that tackle the root causes of poverty and make more progress in reducing it. "
                />
            </div>
        </div>
    );
}

function ResourceCard({name, description, url}: ResourceProps){
    return(
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                backgroundColor: cardBg,
                borderRadius: 8,
                padding: '16px 18px',
                textDecoration: 'none',
                color: textBrown,
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15',
                transition: 'background-color 0.2s ease, transform 0.15s ease',
                minHeight: 260,
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = cardHover;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = cardBg;
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
            }}
        >
            <h3 style={{ margin: '0 0 10px 0', fontSize: 25, fontWeight: 700, textAlign: 'center' }}>{name}</h3>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>{description}</p>
        </a>
    );
} 