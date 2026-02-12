// Created by Christella - 12/8/2025
'use client';

// ============== Marisol Morales 2/5/2026 Code begins ==============
import { useState, useEffect } from 'react';
// ============== Marisol Mores Code Ends 2/5/2026 ==============

type ResourceProps = {
    name: string;
    description: string;
    url: string;
};

// ============== Marisol Modified code 2/5/2026: New type for ResourceCardWithFavorite ==============
type ResourceCardWithFavoriteProps = ResourceProps & {
    isFavorite: boolean;
    onToggleFavorite: () => void;
};
// ============== Marisol Modified code 2/5/2026 End ==============

const cardBg = '#D7C6B4';
const cardHover = '#c9956e';
const textBrown = '#623100';
const pageBg = '#ffffff';

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
            // Check if this URL is already favorited
            const existingIndex = prev.findIndex(fav => fav.url === resourceUrl);
            
            if (existingIndex !== -1) {
                // Remove from favorites
                newFavorites = prev.filter((_, index) => index !== existingIndex);
            } else {
                // Add to favorites with both name and url
                newFavorites = [...prev, { name: resourceName, url: resourceUrl }];
            }
            // Save to localStorage with user-specific key
            const favoritesKey = `favoriteResources_${userEmail}`;
            localStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
            return newFavorites;
        });
    };
    // ============== Marisol Modified code End 2/5/2026 ==============

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
                {/* ============== Marisol Modified code 2/5/2026 Begin: Use new ResourceCardWithFavorite ==============*/}
                {/* UPDATED: Now passes url to toggleFavorite and checks favorites using url */}
                <ResourceCardWithFavorite
                    name="United Nations Children's Fund"
                    url="https://www.unicef.org/"
                    description="UNICEF is a major United Nations agency committed to protecting the rights and well-being of children around the world, with poverty reduction as a main pillar. They stress that poverty is more than just low income. For children, it involves education, health, nutrition, water, and sanitation deprivation. By working with governments and communities, UNICEF advocates for long term solutions to break the cycle of poverty."
                    isFavorite={favorites.some(fav => fav.url === "https://www.unicef.org/")}
                    onToggleFavorite={() => toggleFavorite("United Nations Children's Fund", "https://www.unicef.org/")}
                />
                <ResourceCardWithFavorite
                    name="Innovations for Poverty Action (IPA)"
                    url="https://www.poverty-action.org/"
                    description="Innovations of Poverty Action (IPA) is a research-and-policy nonprofit that aims to find evidence on what methods have and have not been working in global poverty reduction. Through partnerships with researches, NGOs, governments, and sponsors, the IPA designs and evaluates interventions across many countries. They aim to inform people of high-impact poverty-reduction programs. "
                    isFavorite={favorites.some(fav => fav.url === "https://www.poverty-action.org/")}
                    onToggleFavorite={() => toggleFavorite("Innovations for Poverty Action (IPA)", "https://www.poverty-action.org/")}
                />
                <ResourceCardWithFavorite
                    name="Data & Evidence to End Extreme Poverty (DEEP)"
                    url="https://www.deepglobal.org/"
                    description="DEEP is a global consortium dedicated to to improving how poverty is understood and addressed by improving data, analysis, and evidence. They aim to provide governments, decision-makers, researchers, and citizens better tools and evidence to combat poverty. Through their projects, DEEP supports policies and programs that tackle the root causes of poverty and make more progress in reducing it. "
                    isFavorite={favorites.some(fav => fav.url === "https://www.deepglobal.org/")}
                    onToggleFavorite={() => toggleFavorite("Data & Evidence to End Extreme Poverty (DEEP)", "https://www.deepglobal.org/")}
                />
                {/* ============== Marisol Modified code 2/5/2026 End ==============*/}
            </div>
        </div>
    );
}

// ORIGINAL ResourceCard - NOT MODIFIED - done by Christella - 12/08/2025
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
 {/* Added by Marisol 2/5/2026 Star button for favoriting */}
function ResourceCardWithFavorite({name, description, url, isFavorite, onToggleFavorite}: ResourceCardWithFavoriteProps){
    return(
        <div style={{ position: 'relative' }}>
            {/* Star button for favoriting */}
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
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.9)';
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? '#FFD700' : 'none'}
                    stroke={isFavorite ? '#FFD700' : textBrown}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </button>
             {/* End of code Added by Marisol 2/5/2026 Star button for favoriting */}

            {/* Use the original ResourceCard component */}
            <ResourceCard name={name} description={description} url={url} />
        </div>
    );
}
