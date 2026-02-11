"use client";
import { useState, useEffect } from "react";
// ============== Marisol Morales Code 2/9/2026 - React import for dark mode detection ============== //
import React from 'react';
// ============== End React import ============== //
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { FileText, BookOpen, Gamepad2, Heart } from 'lucide-react';

// ============== Marisol Modified code 2/5/2026 Begin ==============
import { Star } from 'lucide-react';
// ============== Marisol Modified code 2/5/2026 End ==============

// ActionCard Component (integrated)
interface ActionCardProps {
  title: string;
  description: string;
  icon: any;
  bgColor: string;
  href: string;
}

function ActionCard({ title, description, icon: Icon, bgColor, href }: ActionCardProps) {
  // Derive a darker accent color from the light background
  const accentColor = bgColor === "#E5F8FF" ? "#8CE4FF" 
    : bgColor === "#FFFCEB" ? "#F5D547"
    : bgColor === "#FFE8D6" ? "#FFA239"
    : "#FF5656";

  // ============== Marisol Morales Code 2/9/2026 - Dark Mode Card Backgrounds ============== //
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
      className="dashboard-card group relative rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left w-full block"
      // ============== Marisol Morales Code 2/9/2026 - Dark Mode Support ============== //
      style={{ 
        backgroundColor: isDark ? darkBgColor : bgColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isDark ? accentColor + '40' : 'var(--color-gray-light)' // Add accent color border in dark mode
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? accentColor + '40' : 'var(--color-gray-light)';
      }}
      // ============== End Dark Mode Support ============== //
    >
      {/* Icon */}
      <div 
        className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: accentColor }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Content */}
      {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text ============== */}
      <h3 
        className="text-xl font-bold mb-2 transition-colors"
        style={{ color: isDark ? 'var(--foreground)' : 'var(--color-gray-dark)' }}
      >
        {title}
      </h3>
      <p 
        className="text-sm leading-relaxed"
        style={{ color: isDark ? 'var(--color-gray)' : 'var(--color-gray)' }}
      >
        {description}
      </p>
      {/* ============== End Dark Mode Text ============== */}

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

    // ============== Marisol Modified code 2/5/2026 Begin ==============
    // Updated to store objects with name and url
    const [favoritedResources, setFavoritedResources] = useState<Array<{name: string, url: string}>>([]);
    // ============== Marisol Modified code 2/5/2026 End ==============

    // Check if user is logged in when page loads
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        const storedUsername = localStorage.getItem('username');
        
        if (userEmail) {
            setIsLoggedIn(true);
            if (storedUsername) {
                setUsername(storedUsername);
            }
            // ============== Marisol Modified code 2/5/2026 Begin ==============
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
            // ============== Marisol Modified code 2/5/2026 End ==============
        } else {
            // if not logged in, fetch daily fact
            (async () => {
                try {
                    const res = await fetch('http://localhost:4000/api/daily-fact');
                    const data = await res.json();
                    if (data?.success && data.fact) {
                        setDailyFact(data.fact);
                    }
                } catch (e) {
                    console.error('Error fetching daily fact:', e);
                } finally {
                    setLoadingFact(false);
                }
            })();
        }
    }, []);

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
            href: "/uploadstory"
        },
        {
            title: "View Stories",
            description: "Browse your contributions and explore stories shared by others in the community",
            icon: BookOpen,
            bgColor: "#FFFCEB",
            href: "/viewstories"
        },
        {
            title: "Play FreeRice",
            description: "Answer trivia & donate rice to help fight hunger. Every correct answer makes a difference!",
            icon: Gamepad2,
            bgColor: "#FFE8D6",
            href: "/freerice"
        },
        {
            title: "Donate Now",
            description: "Discover and contribute to verified causes working to alleviate poverty worldwide",
            icon: Heart,
            bgColor: "#FFE5E5",
            href: "/donationspages"
        }
    ];

    if (isLoggedIn) {
        // display this for is the user is logged in
        return (
            <div className="min-h-screen" style={{ background: 'var(--background)' }}>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Welcome Section */}
                    <div className="mb-12 dashboard-header">
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors ============== */}
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
                        {/* ============== End Dark Mode Text Colors ============== */}
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
                            />
                        ))}
                    </div>

                    {/* Quick Stats Section */}
                    <div className="stats-section grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Card Styling ============== */}
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
                                        24
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
                                        1,250
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#FFA239]/20 flex items-center justify-center">
                                    <Gamepad2 className="w-6 h-6 text-[#FFA239]" />
                                </div>
                            </div>
                        </div>
                        {/* ============== End Dark Mode Card Styling ============== */}

                        {/* ============== Marisol Modified code 2/5/2026 Begin ==============*/}
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Card Styling ============== */}
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
                        {/* ============== Marisol Modified code 2/5/2026 End ==============*/}
                    </div>
                </main>
            </div>
        )
    }

    // display this for if the user is not logged in
    return (
        <div className="min-h-screen pb-12 flex flex-col" style={{ background: 'var(--background)' }}>
            <div className="flex-1">
                <h1 className="pt-16 pb-8 text-center text-5xl md:text-6xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Welcome To PovertyLens!
                </h1>
                
                {/* Creating the columns*/}
                <div className="flex gap-8 px-8 md:px-12 lg:px-16 flex-wrap lg:flex-nowrap max-w-7xl mx-auto">
                    {/* Left column - Introductory text */}
                    {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Styling Start ============== */}
                    <div 
                        className="flex-[11] card card-cyan p-8 md:p-10 transition-colors"
                        style={{
                            backgroundColor: 'var(--background)',
                            border: '2px solid var(--color-cyan)'
                        }}
                    >
                    {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Styling End ============== */}
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors ============== */}
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
                        {/* ============== End Dark Mode Text Colors ============== */}
                    </div>

                    {/* Right column - Logo */}
                    <div className="flex-[9] flex justify-center items-center">
                        <Image
                            src="/logo vertical.png" 
                            alt="PovertyLens Logo" 
                            width={450} 
                            height={450}
                            className="object-contain drop-shadow-2xl"/>
                    </div>
                </div>
            </div>

            {/* Notifications section at bottom - only visible when not logged in */}
            {!loadingFact && dailyFact && (
                <div className="mt-16 px-8 md:px-12 lg:px-16 max-w-7xl mx-auto w-full">
                    <div className="">
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors Start ============== */}
                        <h3 
                            className="font-semibold text-2xl md:text-3xl mb-3"
                            style={{ color: 'var(--foreground)' }}
                        >
                            {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text End ============== */}
                            {dailyFact.title || 'Daily Fact'}
                        </h3>
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors Start ============== */}
                        <p 
                            className="text-lg md:text-xl leading-relaxed"
                            style={{ color: 'var(--color-gray-dark)' }}
                        >
                            {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors End ============== */}
                            {dailyFact.text}
                        </p>
                        {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors Start ============== */}
                        <p 
                            className="text-sm mt-4"
                            style={{ color: 'var(--color-gray)' }}
                        >
                            {/* ============== Marisol Morales Code 2/9/2026 - Dark Mode Text Colors End ============== */}
                            Learn more by signing in to PovertyLens
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}