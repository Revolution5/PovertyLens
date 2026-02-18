// Created by Christella - 12/8/2025
// Created by Christella on Dec. 8, 2025, edited by Christella on Feb. 3, 2026
// UI updated to use globals.css design system - Feb 17, 2026
'use client';

// ============== Marisol Morales 2/5/2026 Code begins ==============
import { useState, useEffect } from 'react';
// ============== Marisol Morales Code Ends 2/5/2026 ==============

type ResourceProps = {
    name: string;
    description: string;
    url: string;
    // ============== Edited by Christella Taguicana - 02/17/2026: Added 'red' variant to support new cards ==============
    variant?: 'cyan' | 'yellow' | 'orange' | 'red';
};

// ============== Marisol Modified code 2/5/2026: New type for ResourceCardWithFavorite ==============
type ResourceCardWithFavoriteProps = ResourceProps & {
    isFavorite: boolean;
    onToggleFavorite: () => void;
};
// ============== Marisol Modified code 2/5/2026 End ==============

// Variant → globals.css card border class
// ============== Edited by Christella Taguicana - 02/17/2026: Added 'red' to variantClass map for new card support ==============
const variantClass: Record<NonNullable<ResourceProps['variant']>, string> = {
    cyan:   'card-cyan',
    yellow: 'card-yellow',
    orange: 'card-orange',
    red:    'card-red', // Added by Christella Taguicana - 02/17/2026
};

// ============================
// Added for LIGHT MODE tinted card backgrounds + hover outline (mirrors ActionCard behavior)
// ============================
const tintBgLight: Record<NonNullable<ResourceProps['variant']>, string> = {
    cyan:   '#E5F8FF',
    yellow: '#FFFCEB',
    orange: '#FFE8D6',
    red:    '#FFE5E5',
};

const accentColorVar: Record<NonNullable<ResourceProps['variant']>, string> = {
    cyan:   'var(--color-cyan)',
    yellow: 'var(--color-yellow)',
    orange: 'var(--color-orange)',
    red:    'var(--color-red)',
};

export default function EducationalResources(){
    // ============== Marisol Modified code Begin 2/5/2026: State management for favorites ==============
    // UPDATED: Now stores objects with name AND url
    const [favorites, setFavorites] = useState<Array<{name: string, url: string}>>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Load user email and favorites from localStorage on component mount
    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        setUserEmail(email);
        
        if (email) {
            const favoritesKey = `favoriteResources_${email}`;
            const storedFavorites = localStorage.getItem(favoritesKey);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        }
    }, []);

    // Toggle favorite status for a resource
    // UPDATED: Now accepts both name and url, and saves per user
    const toggleFavorite = (resourceName: string, resourceUrl: string) => {
        if (!userEmail) return; // Don't save if not logged in
        
        setFavorites(prev => {
            let newFavorites;
            const existingIndex = prev.findIndex(fav => fav.url === resourceUrl);
            
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
    // ============== Marisol Modified code End 2/5/2026 ==============

    return (
        <main
            style={{
                backgroundColor: 'var(--background)',
                minHeight: '100vh',
                padding: '40px 80px 80px',
                color: 'var(--foreground)',
                transition: 'background-color var(--transition-base), color var(--transition-base)',
            }}
        >
            {/*
                ============== Edited by Christella Taguicana - 02/17/2026 ==============
                Dark mode card border override:
                The globals.css card-* classes use bright accent colors for borders which
                look neon in dark mode. This <style> block overrides them with muted,
                lower-opacity versions specifically when dark mode is active, without
                touching globals.css itself.
            */}
            {/*
                ============== Edited by Christella Taguicana - 02/17/2026 ==============
                Dark mode overrides for card borders and accent bars.
                Light mode: no overrides — full vibrant colors come from globals.css.
                Dark mode: muted to ~25-35% opacity so they don't glow neon.

                NOTE: Uses only the .dark class (set on <html> by the app's toggle),
                NOT @media (prefers-color-scheme: dark), because the media query reads
                the OS setting and would incorrectly fire even when the app is in light mode.
            */}
            <style>{`
            .dark .card-cyan   { border-color: rgba(140, 228, 255, 0.22) !important; }
            .dark .card-yellow { border-color: rgba(254, 238, 145, 0.22) !important; }
            .dark .card-orange { border-color: rgba(255, 162, 57,  0.22) !important; }
            .dark .card-red    { border-color: rgba(255, 86,  86,  0.22) !important; }

            .dark .accent-bar-cyan   { background: rgba(140, 228, 255, 0.35) !important; }
            .dark .accent-bar-yellow { background: rgba(245, 213, 71, 0.45) !important; }
            .dark .accent-bar-orange { background: rgba(255, 162, 57,  0.35) !important; }
            .dark .accent-bar-red    { background: rgba(255, 86,  86,  0.35) !important; }
        `}</style>

            {/* ---- Header area ---- */}
            <header style={{ marginBottom: 32, paddingLeft: 24 }}>

                <h1
                    className="text-4xl sm:text-5xl font-bold"
                    style={{
                        margin: '0 0 16px 0',
                        color: 'var(--foreground)',
                    }}
                >
                    Educational Resources
                </h1>

                {/* Decorative divider using brand cyan */}
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
                    Educational resources on poverty will provide you the knowledge, data, and research
                    to deepen your understanding of global and local inequality. This will empower
                    individuals and organizations to make informed decisions and provide solutions to
                    address the root causes of poverty. Engaging with the following resources can help
                    learners, researchers, and advocates to act with evidence-based solutions. Click one
                    of the links below!
                </p>
            </header>

            {/* ---- Subtle gradient background banner ---- */}
            <div
                style={{
                    background: 'var(--gradient-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '32px 24px',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                {/* Resource cards grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0px, 1fr))',
                        gap: 22,
                        alignItems: 'stretch',
                    }}
                >
                    {/* ============== Marisol Modified code 2/5/2026 Begin ==============*/}
                    <ResourceCardWithFavorite
                        name="United Nations Children's Fund"
                        url="https://www.unicef.org/"
                        variant="cyan"
                        description="UNICEF is a major United Nations agency committed to protecting the rights and well-being of children around the world, with poverty reduction as a main pillar. They stress that poverty is more than just low income. For children, it involves education, health, nutrition, water, and sanitation deprivation. By working with governments and communities, UNICEF advocates for long term solutions to break the cycle of poverty."
                        isFavorite={favorites.some(fav => fav.url === "https://www.unicef.org/")}
                        onToggleFavorite={() => toggleFavorite("United Nations Children's Fund", "https://www.unicef.org/")}
                    />
                    <ResourceCardWithFavorite
                        name="Innovations for Poverty Action (IPA)"
                        url="https://www.poverty-action.org/"
                        variant="yellow"
                        description="Innovations of Poverty Action (IPA) is a research-and-policy nonprofit that aims to find evidence on what methods have and have not been working in global poverty reduction. Through partnerships with researches, NGOs, governments, and sponsors, the IPA designs and evaluates interventions across many countries. They aim to inform people of high-impact poverty-reduction programs."
                        isFavorite={favorites.some(fav => fav.url === "https://www.poverty-action.org/")}
                        onToggleFavorite={() => toggleFavorite("Innovations for Poverty Action (IPA)", "https://www.poverty-action.org/")}
                    />
                    <ResourceCardWithFavorite
                        name="Data & Evidence to End Extreme Poverty (DEEP)"
                        url="https://www.deepglobal.org/"
                        variant="orange"
                        description="DEEP is a global consortium dedicated to improving how poverty is understood and addressed by improving data, analysis, and evidence. They aim to provide governments, decision-makers, researchers, and citizens better tools and evidence to combat poverty. Through their projects, DEEP supports policies and programs that tackle the root causes of poverty and make more progress in reducing it."
                        isFavorite={favorites.some(fav => fav.url === "https://www.deepglobal.org/")}
                        onToggleFavorite={() => toggleFavorite("Data & Evidence to End Extreme Poverty (DEEP)", "https://www.deepglobal.org/")}
                    />
                    {/* ============== Added by Christella Taguicana - 02/17/2026 ==============
                        New card: NASSP article on how poverty impacts student education and academic performance */}
                    <ResourceCardWithFavorite
                        name="Poverty & Student Education (NASSP)"
                        url="https://www.nassp.org/poverty-and-its-impact-on-students-education/"
                        variant="red"
                        description="The National Association of Secondary School Principals explores how poverty directly impacts students' academic performance, health, and social development. This resource helps educators and advocates understand the barriers low-income students face and highlights strategies schools can use to support them."
                        isFavorite={favorites.some(fav => fav.url === "https://www.nassp.org/poverty-and-its-impact-on-students-education/")}
                        onToggleFavorite={() => toggleFavorite("Poverty & Student Education (NASSP)", "https://www.nassp.org/poverty-and-its-impact-on-students-education/")}
                    />
                    {/* ============== Added by Christella Taguicana - 02/17/2026 ==============
                        New card: PovertyUSA Teach section with classroom-ready educator resources */}
                    <ResourceCardWithFavorite
                        name="Poverty USA — Teach"
                        url="https://www.povertyusa.org/teach"
                        variant="cyan"
                        description="PovertyUSA's Teach section provides educators with classroom-ready resources, lesson plans, and tools to help students understand the realities of poverty in the United States. It encourages empathy, critical thinking, and informed action among learners of all ages."
                        isFavorite={favorites.some(fav => fav.url === "https://www.povertyusa.org/teach")}
                        onToggleFavorite={() => toggleFavorite("Poverty USA — Teach", "https://www.povertyusa.org/teach")}
                    />
                    {/* ============== Added by Christella Taguicana - 02/17/2026 ==============
                        New card: NCCP — research and policy center focused on child poverty in the US */}
                    <ResourceCardWithFavorite
                        name="National Center for Children in Poverty (NCCP)"
                        url="https://www.nccp.org/"
                        variant="yellow"
                        description="The NCCP is a leading public policy center dedicated to promoting the economic security, health, and well-being of America's low-income families and children. Their research and policy analysis help inform lawmakers, advocates, and communities working to reduce child poverty across the United States."
                        isFavorite={favorites.some(fav => fav.url === "https://www.nccp.org/")}
                        onToggleFavorite={() => toggleFavorite("National Center for Children in Poverty (NCCP)", "https://www.nccp.org/")}
                    />
                    {/* ============== Marisol Modified code 2/5/2026 End ==============*/}
                </div>
            </div>
        </main>
    );
}

// ORIGINAL ResourceCard - visual updated to use globals.css - Christella 12/08/2025
function ResourceCard({ name, description, url, variant }: ResourceProps) {
    const borderClass = variant ? variantClass[variant] : '';

    const tintBg = variant ? tintBgLight[variant] : 'var(--background)';
    const accentBorder = variant ? accentColorVar[variant] : 'var(--color-gray-light)';

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`card ${borderClass}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: 'var(--foreground)',
                height: '100%',
                boxSizing: 'border-box',
                backgroundColor: isDark ? 'transparent' : tintBg,

                // Light mode neutral border
                // Dark mode subtle outline
                borderColor: isDark ? '' : 'var(--color-gray-light)',
            }}
            onMouseEnter={(e) => {
                // Both modes: hover shows bright accent outline
                e.currentTarget.style.borderColor = accentBorder;
            }}
            onMouseLeave={(e) => {
                if (isDark) {
                    // Let your .dark .card-* CSS control muted outline
                    e.currentTarget.style.borderColor = '';
                } else {
                    e.currentTarget.style.borderColor = 'var(--color-gray-light)';
                }
            }}
        >
            {/* Colored accent bar at top, derived from variant */}
            {variant && (
                <div
                    className={`accent-bar-${variant}`}
                    style={{
                        height: 4,
                        borderRadius: 'var(--radius-full)',
                        marginBottom: 14,
                        background: `var(--color-${variant})`,
                    }}
                />
            )}

            <h3
                style={{
                    margin: '0 0 10px 0',
                    fontSize: 20,
                    fontWeight: 700,
                    textAlign: 'left',
                    color: 'var(--foreground)',
                }}
            >
                {name}
            </h3>
            <p
                style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: 1.65,
                    color: 'var(--color-gray-dark)',
                }}
            >
                {description}
            </p>
        </a>
    );
}

{/* Added by Marisol 2/5/2026 Star button for favoriting */}
function ResourceCardWithFavorite({ name, description, url, variant, isFavorite, onToggleFavorite }: ResourceCardWithFavoriteProps) {
    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Star button — uses globals.css focus-visible ring via *:focus-visible */}
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
            {/* End of code Added by Marisol 2/5/2026 */}

            <ResourceCard name={name} description={description} url={url} variant={variant} />
        </div>
    );
}
