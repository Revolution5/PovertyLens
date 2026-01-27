"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    // Hooks initialization
    const router = useRouter();
    
    // Code for the dropdown menus (Resources and User Menu)
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    
    // State for toggling search bar visibility
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // State for the search input value
    const [searchQuery, setSearchQuery] = useState("");

    // Add state to track if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in on component mount
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            setIsLoggedIn(true);
        }
    }, []);

    // Handle logout function
    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        router.push('/'); 
    };

    // Search logic: Handles the form submission (when Enter is pressed)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            
            // Check for known exact navigation pages
            if (query === 'Home') {
                router.push('/');
                setIsSearchOpen(false);
                return;
            }
            
            // Proceed to the general search results page
            const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
            router.push(searchUrl);
        }
    };

    // Inline style for hover effects
    const navLinkStyle = {
        transition: 'color 0.2s ease-in-out'
    };

    const dropdownItemStyle = {
        transition: 'all 0.2s ease-in-out'
    };

    return (
        <nav className="py-2 md:py-4 border-b-2" style={{ backgroundColor: '#F9F7F2', borderColor: '#9CAF88' }}>
            <div className="px-3 md:px-6 lg:px-10 flex items-center justify-between gap-2 md:gap-4">
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <Image
                            src="/logov3.png" 
                            alt="PovertyLens Logo" 
                            width={120} 
                            height={120}
                            className="object-contain w-16 h-auto sm:w-20 md:w-24 lg:w-28"/>
                    </Link>
                </div>

                <div className="flex gap-2 sm:gap-4 md:gap-8 lg:gap-16 xl:gap-24 2xl:gap-32 items-center justify-center flex-1">
                <Link 
                    href="/" 
                    className="font-bold text-base sm:text-lg md:text-xl lg:text-3xl"
                    style={{ ...navLinkStyle, color: '#2D4739' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C26D52'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2D4739'}
                >
                    Home
                </Link>

                <Link 
                    href="/statistics" 
                    className="font-bold text-base sm:text-lg md:text-xl lg:text-3xl"
                    style={{ ...navLinkStyle, color: '#2D4739' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C26D52'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2D4739'}
                >
                    Statistics
                </Link>

                { /* Dropdown Menu for Resources */} 
                <div
                    className="relative"
                    onMouseEnter={() => setResourcesOpen(true)}
                    onMouseLeave={() => setResourcesOpen(false)}
                >
                    <span 
                        className="font-bold text-base sm:text-lg md:text-xl lg:text-3xl cursor-pointer"
                        style={{ ...navLinkStyle, color: '#2D4739' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#C26D52'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2D4739'}
                    >
                        Resources
                    </span>
                    
                    {resourcesOpen && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-0 border-2 shadow-lg rounded-lg py-2 w-56 z-50" style={{ backgroundColor: '#F9F7F2', borderColor: '#9CAF88' }}>
                            <Link 
                                href="/eduresource" 
                                className="block px-4 py-2"
                                style={{ ...dropdownItemStyle, color: '#2D4739', backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9CAF88';
                                    e.currentTarget.style.color = '#F9F7F2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#2D4739';
                                }}
                            >
                                Educational Resources
                            </Link>
                            <Link 
                                href="/donationspages" 
                                className="block px-4 py-2"
                                style={{ ...dropdownItemStyle, color: '#2D4739', backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9CAF88';
                                    e.currentTarget.style.color = '#F9F7F2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#2D4739';
                                }}
                            >
                                Donations & Volunteer
                            </Link>
                        </div>
                    )}
                </div>

                <Link 
                    href="/FAQ" 
                    className="font-bold text-base sm:text-lg md:text-xl lg:text-3xl"
                    style={{ ...navLinkStyle, color: '#2D4739' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C26D52'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2D4739'}
                >
                    FAQ
                </Link>

                <Link 
                    href="/AboutUs" 
                    className="font-bold text-base sm:text-lg md:text-xl lg:text-3xl"
                    style={{ ...navLinkStyle, color: '#2D4739' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C26D52'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#2D4739'}
                >
                    About Us
                </Link>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {isSearchOpen && (
                        // Display the input field if isSearchOpen is true
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Quick Search..."
                                className="w-28 sm:w-36 md:w-40 lg:w-48 p-1 sm:p-2 text-xs sm:text-sm md:text-base border-2 rounded-full focus:outline-none focus:ring-2 placeholder:opacity-50"
                                style={{ 
                                    borderColor: '#9CAF88', 
                                    backgroundColor: '#F9F7F2',
                                    color: '#2D4739'
                                }}
                                onFocus={(e) => e.currentTarget.style.outlineColor = '#C26D52'}
                                autoFocus 
                            />
                            {/* Hidden submit button (Enter key works) */}
                            <button type="submit" className="hidden" aria-label="Submit Search"></button>
                        </form>
                    )}
                    
                    {/* The Search Icon that toggles the input field */}
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)} 
                        className="p-0.5 sm:p-1 transition-all duration-200 hover:scale-110 flex-shrink-0"
                        aria-label={isSearchOpen ? "Close Search" : "Open Search"}
                    >
                        <Image
                            src="/search2.png" 
                            alt="search icon" 
                            width={40} 
                            height={40}
                            className="object-contain w-5 h-auto sm:w-6 md:w-7 lg:w-10"/>
                    </button>
                </div>
                {/* -------------------------------------- */}
            
                { /* Drop down menu for user*/}
                <div
                    className="relative"
                    onMouseEnter={() => setUserMenuOpen(true)}
                    onMouseLeave={() => setUserMenuOpen(false)}
                >
                    <div className="transition-all duration-200 hover:scale-110 cursor-pointer flex-shrink-0">
                        <Image
                            src="/user2.png"
                            alt="user icon"
                            width={40}
                            height={40}
                            className="object-contain w-5 h-auto sm:w-6 md:w-7 lg:w-10"
                        />
                    </div>
                    {userMenuOpen && (
                        <div className="absolute top-full right-0 mt-0.25 border-2 shadow-lg rounded-lg py-2 w-48 z-50" style={{ backgroundColor: '#F9F7F2', borderColor: '#9CAF88' }}>
                            {/* Show different options based on login status */}
                            {isLoggedIn ? (
                                <>
                                    {/* Show these options when user is logged in */}
                                    <Link 
                                        href="/profile" 
                                        className="block px-4 py-2"
                                        style={{ ...dropdownItemStyle, color: '#2D4739', backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#9CAF88';
                                            e.currentTarget.style.color = '#F9F7F2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#2D4739';
                                        }}
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2"
                                        style={{ ...dropdownItemStyle, color: '#2D4739', backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#9CAF88';
                                            e.currentTarget.style.color = '#F9F7F2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#2D4739';
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Show these options when user is NOT logged in */}
                                    <Link 
                                        href="/signin" 
                                        className="block px-4 py-2"
                                        style={{ ...dropdownItemStyle, color: '#2D4739', backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#9CAF88';
                                            e.currentTarget.style.color = '#F9F7F2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#2D4739';
                                        }}
                                    >
                                        Sign In/Login
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}