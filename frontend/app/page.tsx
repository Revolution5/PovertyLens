"use client";
import { useState, useEffect } from "react";
// ============== Marisol Morales Code 1/9/2026 - React import for dark mode detection ============== //
import React from 'react';
// ============== End React import ============== //
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { FileText, BookOpen, Gamepad2, Heart, Compass, HandHeart, Globe } from 'lucide-react'; // Modified by Christella - 03/06/2026 - to include handheart

// ============== Marisol Modified code for Fav Resources 2/5/2026 Begin ==============
import { Star } from 'lucide-react';
// ============== Marisol Modified code for Fav Resources 2/5/2026 End ==============

// ============== App Tour Component - Added by Marisol 2/9/2026 ==============
import { AppTour } from '@/components/AppTour'; // Tour for non-logged-in users on the public landing page
// ============== End App Tour Import ==============

// ============== User App Tour Component - Added by Marisol 2/25/2026 ==============
import { UserAppTour } from '@/components/UserAppTour'; // Separate tour specifically for logged-in users on the dashboard - kept separate from AppTour intentionally
// ============== End User App Tour Import ==============

// Added by Christella - 03/17/2026 - public bento pledge wall for the landing page
import PledgeWallPublic from '@/components/PledgeWallPublic';
// End of addition by Christella - 03/17/2026

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000' // Added by Marisol for easier backend URL management 2/3/2025

// ActionCard Component (integrated)
interface ActionCardProps {
  title: string;
  description: string;
  icon: any;
  bgColor: string;
  href: string;
  tourId?: string; // Added by Marisol 2/25/2026 - optional prop for data-tour attribute, used by UserAppTour to highlight this card
  className?: string; // Edited by Christella - 03/24/2026 - allows specific cards to span full grid width
}

function ActionCard({ title, description, icon: Icon, bgColor, href, tourId, className = '' }: ActionCardProps) {
  // Derive a darker accent color from the light background
  const accentColor = bgColor === "#E5F8FF" ? "#8CE4FF" 
    : bgColor === "#FFFCEB" ? "#F5D547"
    : bgColor === "#FFE8D6" ? "#FFA239"
    : "#FF5656";

  // ============== Marisol Morales Code 1/9/2026 - Dark Mode Card Backgrounds ============== //
  // Dark mode versions of the card backgrounds - much darker for better contrast
  const darkBgColor = bgColor === "#E5F8FF" ? "#0a2a35"  // Cyan card - dark teal
    : bgColor === "#FFFCEB" ? "#2d2a1a"  // Yellow card - dark gold
    : bgColor === "#FFE8D6" ? "#2d1f14"  // Orange card - dark orange
    : "#2d1414";  // Red card - dark red
  
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  // ============== End Dark Mode Card Backgrounds ============== //

  return (
    <Link
      href={href}
      className={`dashboard-card group relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left w-full block ${className}`}
      data-tour={tourId} // Added by Marisol 2/25/2026 - applies the data-tour attribute so UserAppTour can locate and highlight this card
      style={{ 
        backgroundColor: isDark ? darkBgColor : bgColor, //  ============== Marisol Morales Code 1/9/2026 - Dark Mode Support ============== //
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDark ? accentColor + '40' : 'var(--color-gray-light)' // Marisol Code 1/9/2026 Add accent color border in dark mode
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? accentColor + '40' : 'var(--color-gray-light)'; // Marisol Code 1/9/2026 Add accent color border in dark mode
      }}
    >
      {/* Icon */}
      <div 
        className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: accentColor }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      <h3 
        className="text-xl font-bold mb-2 transition-colors"
        style={{ color: isDark ? 'var(--foreground)' : 'var(--color-gray-dark)' }} // Changed by Marisol 1/12/2026 for Dark Mode Support
      >
        {title}
      </h3>
      <p 
        className="text-sm leading-relaxed"
        style={{ color: isDark ? 'var(--color-gray)' : 'var(--color-gray)' }} // Changed by Marisol 1/12/2026 for Dark Mode Support - using same gray but could adjust if needed
      >
        {description}
      </p>

      {/* Arrow indicator */}
      <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: accentColor }}>
        Get Started
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default function Home() {
    // state to track if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    // state to check the logged in user username
    const [username, setUsername] = useState("User");
    const [dailyFact, setDailyFact] = useState<null | { _id?: string; title?: string; text?: string }>(null);
    const [loadingFact, setLoadingFact] = useState(true);

    // ============== Marisol Modified code for Fav Resources 2/5/2026 Begin ==============
    // Updated to store objects with name and url
    const [favoritedResources, setFavoritedResources] = useState<Array<{name: string, url: string}>>([]);
    // ============== Marisol Modified code for Fav Resources 2/5/2026 End ==============

    const [storyCount, setStoryCount] = useState<number>(0); // Added by Christella to show user how many stories they uplodated - 03/05/2026

    // ============== FreeRice Total Grains State - Added by Marisol 2/3/2026 ==============
    const [totalGrains, setTotalGrains] = useState<number>(0);
    const [loadingGrains, setLoadingGrains] = useState(true);
    // ============== End FreeRice Total Grains State ==============

    // ============== App Tour State - Added by Marisol 2/9/2026 ==============
    const [isTourOpen, setIsTourOpen] = useState(false); // controls the public AppTour
    // ============== End App Tour State ==============

    // ============== User App Tour State - Added by Marisol 2/25/2026 ==============
    const [isUserTourOpen, setIsUserTourOpen] = useState(false); // controls the logged-in UserAppTour - kept separate from isTourOpen intentionally
    // ============== End User App Tour State ==============

    // Check if user is logged in when page loads
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        const storedUsername = localStorage.getItem('username');
        
        if (userEmail) {
            setIsLoggedIn(true);
            if (storedUsername) {
                setUsername(storedUsername);
            }
            // ============== Marisol Modified code for fav resources 2/5/2026 Begin ==============
            // Make favorites user-specific by using email in the key
            const favoritesKey = `favoriteResources_${userEmail}`;
            const storedFavorites = localStorage.getItem(favoritesKey);
            if (storedFavorites) {
                try {
                    const parsed = JSON.parse(storedFavorites);
                    
                    // Check if it's the old format (array of strings)
                    if (parsed.length > 0 && typeof parsed[0] === 'string') {
                        console.log('Migrating old favorites format to new format');
                        // Clear old favorites - user will need to re-favorite
                        localStorage.removeItem(favoritesKey);
                        setFavoritedResources([]);
                    } else {
                        // New format - use as is
                        setFavoritedResources(parsed);
                    }
                } catch (e) {
                    console.error('Error loading favorites:', e);
                    setFavoritedResources([]);
                }
            }
            // ============== Marisol Modified code for fav resources 2/5/2026 End ==============
            
            // ==== Christella modified code for story count display - 03/05/2026 ====
            // Fetch story count
            fetch(`http://localhost:4000/api/stories?userEmail=${encodeURIComponent(userEmail)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.stories)) {
                    setStoryCount(data.stories.length);
                    }
                })
                .catch(err => console.error('Error fetching story count:', err));
            // ==== End of addition by Christella - 03/05/2026 ====
            // ============== Fetch FreeRice Total Grains - Added by Marisol 2/3/2026 ==============
            fetchUserTotalGrains(userEmail);
            // ============== End Fetch FreeRice Total Grains ==============
        } else {
            //Daily Facts added by Damon
            //if not logged in, fetch daily fact
            (async () => {
                try {
                    const res = await fetch('http://localhost:4000/api/daily-facts');
                    const data = await res.json();
                    if (data?.success && Array.isArray(data.facts) && data.facts.length > 0) {
                        setDailyFact(data.facts[0]);
                    }
                } catch (e) {
                    console.error('Error fetching daily fact:', e);
                } finally {
                    setLoadingFact(false);
                }
            })();
        }
    }, []);

    // ============== Fetch User's Total FreeRice Grains - Added by Marisol 2/3/2026 ==============
    async function fetchUserTotalGrains(email: string) {
        setLoadingGrains(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/freerice/user-total?email=${encodeURIComponent(email)}`).catch(() => null);
            if (!res) {
                setTotalGrains(0);
                setLoadingGrains(false);
                return;
            }

            if (!res.ok) {
                console.error('Failed to fetch FreeRice data:', res.status);
                setLoadingGrains(false);
                return;
            }

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                console.error('FreeRice endpoint returned non-JSON');
                setLoadingGrains(false);
                return;
            }

            const data = await res.json();
            if (data && data.success) {
                // Use the totalGrains directly from the dedicated endpoint
                setTotalGrains(data.totalGrains || 0);
            }
        } catch (err) {
            console.error('Error fetching FreeRice total:', err);
        } finally {
            setLoadingGrains(false);
        }
    }
    // ============== End Fetch User's Total FreeRice Grains ==============

    // GSAP Staggered Entrance Animation
    useEffect(() => {
        if (isLoggedIn) {
            // Animate header first
            gsap.fromTo('.dashboard-header',
                { opacity: 0, y: -20 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6,
                    ease: 'power3.out'
                }
            );

            // Then animate cards with stagger
            gsap.fromTo('.dashboard-card',
                { opacity: 0, y: 40, scale: 0.95 },
                { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: 'power3.out',
                    delay: 0.2
                }
            );

            // Animate stats section
            gsap.fromTo('.stats-section',
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                    delay: 0.8
                }
            );
        }
    }, [isLoggedIn]);

    // Action cards configuration
    const actionCards = [
    {
        title: "Upload a Story",
        description: "Share your experience or insights about poverty and help build awareness in the community",
        icon: FileText,
        bgColor: "#E5F8FF",
        href: "/uploadstory",
        tourId: "upload-story" // Added by Marisol 2/25/2026 - matches data-tour target in UserAppTour step 2
    },
    {
        title: "View Stories",
        description: "Browse your contributions and explore stories shared by others in the community",
        icon: BookOpen,
        bgColor: "#FFFCEB",
        href: "/viewstories",
        tourId: "view-stories" // Added by Marisol 2/25/2026 - matches data-tour target in UserAppTour step 3
    },
    {
        title: "Play FreeRice",
        description: "Answer trivia & donate rice to help fight hunger. Every correct answer makes a difference!",
        icon: Gamepad2,
        bgColor: "#FFE8D6",
        href: "/freerice",
        tourId: "play-freeRice" // Added by Marisol 2/25/2026 - matches data-tour target in UserAppTour step 4
    },
    {
        title: "Donate Now",
        description: "Discover and contribute to verified causes working to alleviate poverty worldwide",
        icon: Heart,
        bgColor: "#FFE5E5",
        href: "/donationspages",
        tourId: "donate-now" // Added by Marisol 2/25/2026 - matches data-tour target in UserAppTour step 5
    },
    // Modified by Christella - 03/20/2026 - moved Pledge Wall into actionCards array so it sits next to Currency Calculator
    {
        title: "Pledge Wall",
        description: "Make a public commitment to take action against poverty and see what others are pledging.",
        icon: HandHeart,
        bgColor: "#E5F8FF",
        href: "/pledgewalluser",
        tourId: "pledge-wall", // Added by Marisol 3/5/2026 - matches data-tour target in UserAppTour step 7
        className: "md:col-span-2" // Edited by Christella - 03/24/2026 - makes Pledge Wall span the full row
    },
    // End of modification by Christella - 03/20/2026
];

    if (isLoggedIn) {
        // display this for is the user is logged in
        return (
            <div className="min-h-screen" style={{ background: 'var(--background)' }}>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Section */}
                    {/* ============== data-tour added by Marisol 2/25/2026 - targets step 1 of UserAppTour ============== */}
                    <div className="mb-12 dashboard-header" data-tour="welcome-back">
                        {/* flex row added by Marisol 2/25/2026 - keeps heading and tour button side by side */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 
                                    className="text-4xl sm:text-5xl font-bold mb-3"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    Welcome back, <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">{username}</span>
                                </h1>
                                <p 
                                    className="text-lg"
                                    style={{ color: 'var(--color-gray)' }}
                                >
                                    Here's your dashboard
                                </p>
                            </div>
                            {/* ============== User App Tour Button - Added by Marisol 2/25/2026 ============== */}
                            {/* Separate from the public AppTour button - this one only appears for logged-in users */}
                            <button
                                onClick={() => setIsUserTourOpen(true)} // opens UserAppTour, not AppTour
                                className="group px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
                                style={{
                                    background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)',
                                    color: 'white'
                                }}
                            >
                                <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                                <span>Take the Tour</span>
                            </button>
                            {/* ============== End User App Tour Button ============== */}
                        </div>
                    </div>

                    {/* Action Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
                        {actionCards.map((card, index) => (
                            <ActionCard
                                key={index}
                                title={card.title}
                                description={card.description}
                                icon={card.icon}
                                bgColor={card.bgColor}
                                href={card.href}
                                tourId={card.tourId} // Added by Marisol 2/25/2026 - passes tourId so each card gets its data-tour attribute for UserAppTour
                                className={card.className} // Edited by Christella - 03/24/2026 - supports full-width cards like Pledge Wall
                            />
                        ))}
                    </div>
                    {/* Pledge Wall card is now part of actionCards array above - Modified by Christella 03/20/2026 */}

                    {/* Quick Stats Section */}
                    <div className="stats-section grid grid-cols-1 sm:grid-cols-3 gap-6" data-tour="bottom-cards"> {/* ============== data-tour added by Marisol 2/25/2026 - targets step 6 of UserAppTour ============== */}
                        <div 
                            className="rounded-xl p-6 shadow-sm transition-colors"
                            style={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--color-gray-light)'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p 
                                        className="text-sm mb-1"
                                        style={{ color: 'var(--color-gray)' }}
                                    >
                                        Stories Shared
                                    </p>
                                    <p 
                                        className="text-3xl font-semibold"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {storyCount}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#8CE4FF]/20 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-[#8CE4FF]" />
                                </div>
                            </div>
                        </div>

                        <div 
                            className="rounded-xl p-6 shadow-sm transition-colors"
                            style={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--color-gray-light)'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p 
                                        className="text-sm mb-1"
                                        style={{ color: 'var(--color-gray)' }}
                                    >
                                        Rice Donated
                                    </p>
                                    <p 
                                        className="text-3xl font-semibold"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {loadingGrains ? '...' : totalGrains.toLocaleString()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#FFA239]/20 flex items-center justify-center">
                                    <Gamepad2 className="w-6 h-6 text-[#FFA239]" />
                                </div>
                            </div>
                        </div>

                        {/* ============== Marisol Modified code for fav Resource 2/5/2026 Begin ==============*/}
                        {/* ============== Marisol Morales Code 1/9/2026 - Dark Mode Card Styling ============== */}
                        <div 
                            className="rounded-xl p-6 shadow-sm transition-colors"
                            style={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--color-gray-light)'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p 
                                        className="text-sm mb-1"
                                        style={{ color: 'var(--color-gray)' }}
                                    >
                                        Favorited Resources
                                    </p>
                                    <p 
                                        className="text-3xl font-semibold"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {favoritedResources.length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-[#FFD700]" />
                                </div>
                            </div>
                            {/* Show list of favorited resources if any exist */}
                            {favoritedResources.length > 0 && (
                                <div 
                                    className="mt-4 pt-4"
                                    style={{ borderTop: '1px solid var(--color-gray-light)' }}
                                >
                                    <p 
                                        className="text-xs mb-2 font-medium"
                                        style={{ color: 'var(--color-gray)' }}
                                    >
                                        Your Favorites:
                                    </p>
                                    <ul className="space-y-1">
                                        {favoritedResources.map((resource, idx) => (
                                            <li 
                                                key={idx} 
                                                className="text-xs flex items-start group"
                                                style={{ color: 'var(--foreground)' }}
                                            >
                                                <Star className="w-3 h-3 text-[#FFD700] mr-1.5 mt-0.5 flex-shrink-0" fill="#FFD700" />
                                                <Link 
                                                    href={resource.url || '#'}
                                                    target={resource.url ? "_blank" : undefined}
                                                    rel={resource.url ? "noopener noreferrer" : undefined}
                                                    className="line-clamp-2 hover:text-[#FFA239] hover:underline transition-colors cursor-pointer"
                                                >
                                                    {resource.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* ============== End Dark Mode Card Styling ============== */}
                        {/* ============== Marisol Modified for fav resources code 2/5/2026 End ==============*/}
                    </div>
                </main>

                {/* ============== User App Tour Component - Added by Marisol 2/25/2026 ============== */}
                {/* Kept completely separate from <AppTour> which is only rendered in the non-logged-in return below */}
                <UserAppTour isOpen={isUserTourOpen} onClose={() => setIsUserTourOpen(false)} />
                {/* ============== End User App Tour Component ============== */}
            </div>
        )
    }

    // display this for if the user is not logged in
    // Modified by Christella - 03/20/2026 - moved daily facts under logo, logo moved up, equal columns, responsive gap
    return (
        <div className="min-h-screen pb-12 flex flex-col" style={{ background: 'var(--background)' }}>
            <div className="flex-1">
                <h1 
                    className="pt-16 pb-8 text-center text-5xl md:text-6xl font-bold" 
                    style={{ color: 'var(--foreground)' }}
                    data-tour="welcome"
                >
                    Welcome To PovertyLens!
                </h1>
                
                {/* Creating the columns - equal flex-1 on both sides, responsive gap */}
                <div className="flex gap-8 md:gap-10 lg:gap-16 px-8 md:px-12 lg:px-16 flex-wrap lg:flex-nowrap max-w-7xl mx-auto items-stretch">

                    {/* Left column - Introductory text */}
                    <div 
                        className="flex-1 card card-cyan p-8 md:p-12 transition-colors flex flex-col"
                        style={{
                            backgroundColor: 'var(--background)',
                            border: '2px solid var(--color-cyan)'
                        }}
                        data-tour="mission" // Added by Marisol for App Tour 2/10/2026
                    >
                        <h2 className="font-bold text-3xl md:text-4xl mb-6" style={{ color: 'var(--foreground)' }}>
                            Our Mission:
                        </h2>
                        <p className="text-lg md:text-xl mb-5 leading-relaxed" style={{ color: 'var(--color-gray-dark)' }}>
                            Poverty affects millions worldwide, yet it remains 
                            one of the most misunderstood and underrepresented global issues.
                            PovertyLens hopes to bridges this gap by transforming complex data and real-world stories into meaningful,
                            easy-to-understand insights.
                        </p>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--color-gray-dark)' }}>
                            We hope to empower everyone, whether that's supporting global initiatives, 
                            donating, or spreading awareness within their own communities.
                        </p>

                        {/* ============== App Tour Button - Added by Marisol 2/10/2026 ============== */}
                        <button
                            onClick={() => setIsTourOpen(true)}
                            className="mt-8 w-full group px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
                            style={{
                                background: 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)',
                                color: 'white'
                            }}
                            data-tour="tour-button"
                            suppressHydrationWarning
                        >
                            <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                            <span>Take the App Tour</span>
                        </button>
                        {/* ============== End App Tour Button ============== */}
                    </div>

                    {/* Right column - Logo at top, daily facts below, equal width to left column */}
                    <div className="flex-1 flex flex-col justify-start gap-6">

                        {/* Logo - sits at top of column */}
                        <div className="flex justify-center pt-2">
                            <Image
                                src="/logo vertical.png" 
                                alt="PovertyLens Logo" 
                                width={420} 
                                height={420}
                                className="object-contain drop-shadow-2xl"/>
                        </div>

                        {/*Daily Facts added by Damon */}
                        {/* Daily fact moved here under the logo - Modified by Christella 03/20/2026 */}
                        {!loadingFact && dailyFact && (
                            <div data-tour="daily-fact">
                                <h3 
                                    className="font-semibold text-xl md:text-2xl mb-3"
                                    style={{ color: 'var(--foreground)' }}
                                >
                                    {dailyFact.title || 'Daily Fact'}
                                </h3>
                                <p 
                                    className="text-base md:text-lg leading-relaxed"
                                    style={{ color: 'var(--color-gray-dark)' }}
                                >
                                    {dailyFact.text}
                                </p>
                                <p 
                                    className="text-sm mt-3"
                                    style={{ color: 'var(--color-gray)' }}
                                >
                                    Learn more by signing in to PovertyLens
                                </p>
                            </div>
                        )}
                        {/* End of daily fact move - Christella 03/20/2026 */}
                    </div>

                </div>
            </div>

            {/* Added by Christella - 03/17/2026 - public bento pledge wall, wrapped to match mission section margins */}
            <div className="px-8 md:px-12 lg:px-16 max-w-7xl mx-auto w-full mt-12">
                <PledgeWallPublic />
            </div>
            {/* End of addition by Christella - 03/17/2026 */}

            {/* ============== App Tour Component - Added by Marisol 2/10/2026 ============== */}
            <AppTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
            {/* ============== End App Tour Component ============== */}
        </div>
    );
    // End of modification by Christella - 03/20/2026
}