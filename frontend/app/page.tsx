"use client";
import { useState , useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';

export default function Home() {
    // state to track if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    // state to check the logged in user username
    const [username, setUsername] = useState("User"); 

    // Check if user is logged in when page loads
    useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const storedUsername = localStorage.getItem('username');
    
    if (userEmail) {
        setIsLoggedIn(true);
        if (storedUsername) {
            setUsername(storedUsername);
            }
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
                    stagger: 0.15, // Each card delays by 0.15s
                    ease: 'power3.out',
                    delay: 0.2 // Start after header animation
                }
            );
        }
    }, [isLoggedIn]);

    if (isLoggedIn) {
        // display this for is the user is logged in
        return (
            <div className="min-h-screen bg-gradient-light">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                    {/* Header */}
                    <div className="mb-10 dashboard-header">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                            Welcome back, {username}
                        </h1>
                        <p className="text-lg text-gray-600">Here's your dashboard</p>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="dashboard-grid">
                        {/* Primary Card - Upload Story */}
                        <Link href="/uploadstory" className="dashboard-card dashboard-card-primary dashboard-card-cyan">
                            <div className="dashboard-card-top">
                                <div className="dashboard-card-icon-box dashboard-card-icon-cyan">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="12" y1="18" x2="12" y2="12"></line>
                                        <line x1="9" y1="15" x2="15" y2="15"></line>
                                    </svg>
                                </div>
                                <div className="dashboard-card-arrow">→</div>
                            </div>
                            <div className="dashboard-card-text">
                                <h3 className="dashboard-card-title dashboard-card-title-primary">Upload a Story</h3>
                                <p className="dashboard-card-description dashboard-card-description-primary">Share your experience or insights about poverty and help build awareness in the community</p>
                            </div>
                        </Link>

                        {/* View Stories */}
                        <Link href="/viewstories" className="dashboard-card dashboard-card-yellow">
                            <div className="dashboard-card-top">
                                <div className="dashboard-card-icon-box dashboard-card-icon-yellow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                </div>
                                <div className="dashboard-card-arrow">→</div>
                            </div>
                            <div className="dashboard-card-text">
                                <h3 className="dashboard-card-title">View Stories</h3>
                                <p className="dashboard-card-description">Browse your contributions</p>
                            </div>
                        </Link>

                        {/* Play FreeRice */}
                        <Link href="/freerice" className="dashboard-card dashboard-card-orange">
                            <div className="dashboard-card-top">
                                <div className="dashboard-card-icon-box dashboard-card-icon-orange">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                                        <path d="M2 12A10 10 0 0 0 12 22"></path>
                                    </svg>
                                </div>
                                <div className="dashboard-card-arrow">→</div>
                            </div>
                            <div className="dashboard-card-text">
                                <h3 className="dashboard-card-title">Play FreeRice</h3>
                                <p className="dashboard-card-description">Answer trivia & donate</p>
                            </div>
                        </Link>

                        {/* Donate Now */}
                        <Link href="/donationspages" className="dashboard-card dashboard-card-red">
                            <div className="dashboard-card-top">
                                <div className="dashboard-card-icon-box dashboard-card-icon-red">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </div>
                                <div className="dashboard-card-arrow">→</div>
                            </div>
                            <div className="dashboard-card-text">
                                <h3 className="dashboard-card-title">Donate Now</h3>
                                <p className="dashboard-card-description">Support the cause</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // display this for if the user is not logged in
    return (
        <div className="min-h-screen bg-gradient-light pb-12">
                <h1 className="pt-16 pb-8 text-center text-5xl md:text-6xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Welcome To PovertyLens!
                </h1>
                
                {/* Creating the columns*/}
                <div className="flex gap-8 px-8 md:px-12 lg:px-16 flex-wrap lg:flex-nowrap max-w-7xl mx-auto">
                    {/* Left column - Introductory text */}
                    <div className="flex-[11] card card-cyan p-8 md:p-10">
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
                    </div>

                    {/* Right column - Logo */}
                    <div className="flex-[9] flex justify-center items-center">
                            <Image
                                src="/logov3.png" 
                                alt="PovertyLens Logo" 
                                width={450} 
                                height={450}
                                className="object-contain drop-shadow-2xl"/>
                    </div>
                </div>
        </div>
    );
}