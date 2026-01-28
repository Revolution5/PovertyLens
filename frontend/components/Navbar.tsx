"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    // Hooks initialization
    const router = useRouter();
    const pathname = usePathname(); // Get current path for active page highlighting
    
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

    // Helper function to check if a path is active
    const isActive = (path: string) => {
        return pathname === path;
    };

    // Inline style for hover effects
    const navLinkStyle = {
        transition: 'all 0.2s ease-in-out'
    };

    const dropdownItemStyle = {
        transition: 'all 0.2s ease-in-out'
    };

    return (
        <nav className="sticky top-0 z-50 py-2.5 md:py-3 border-b-2 shadow-sm backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#8CE4FF' }}>
            <div className="px-6 md:px-10 lg:px-16 flex items-center justify-between gap-6 md:gap-8">
                {/* Logo - Smaller */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <Image
                            src="/logov3.png" 
                            alt="PovertyLens Logo" 
                            width={80} 
                            height={80}
                            className="object-contain w-14 h-auto sm:w-16 md:w-18 lg:w-20"/>
                    </Link>
                </div>

                {/* Navigation Links - Compact */}
                <div className="flex gap-5 md:gap-8 lg:gap-12 xl:gap-16 items-center justify-center flex-1">
                    <Link 
                        href="/" 
                        className="font-semibold text-sm md:text-base lg:text-lg relative"
                        style={{ 
                            ...navLinkStyle, 
                            color: isActive('/') ? '#FFA239' : '#1a1a1a',
                            paddingBottom: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFA239'}
                        onMouseLeave={(e) => e.currentTarget.style.color = isActive('/') ? '#FFA239' : '#1a1a1a'}
                    >
                        Home
                        {isActive('/') && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFA239' }}></span>
                        )}
                    </Link>

                    <Link 
                        href="/statistics" 
                        className="font-semibold text-sm md:text-base lg:text-lg relative"
                        style={{ 
                            ...navLinkStyle, 
                            color: isActive('/statistics') ? '#FFA239' : '#1a1a1a',
                            paddingBottom: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFA239'}
                        onMouseLeave={(e) => e.currentTarget.style.color = isActive('/statistics') ? '#FFA239' : '#1a1a1a'}
                    >
                        Statistics
                        {isActive('/statistics') && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFA239' }}></span>
                        )}
                    </Link>

                    {/* Dropdown Menu for Resources with Arrow Indicator */} 
                    <div
                        className="relative"
                        onMouseEnter={() => setResourcesOpen(true)}
                        onMouseLeave={() => setResourcesOpen(false)}
                    >
                        <span 
                            className="font-semibold text-sm md:text-base lg:text-lg cursor-pointer flex items-center gap-1 relative"
                            style={{ 
                                ...navLinkStyle, 
                                color: (isActive('/eduresource') || isActive('/donationspages')) ? '#FFA239' : '#1a1a1a',
                                paddingBottom: '2px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFA239'}
                            onMouseLeave={(e) => e.currentTarget.style.color = (isActive('/eduresource') || isActive('/donationspages')) ? '#FFA239' : '#1a1a1a'}
                        >
                            Resources
                            {/* Dropdown Arrow Indicator */}
                            <svg 
                                width="10" 
                                height="10" 
                                viewBox="0 0 12 12" 
                                fill="currentColor"
                                style={{ 
                                    transform: resourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease-in-out'
                                }}
                            >
                                <path d="M6 8L2 4h8L6 8z"/>
                            </svg>
                            {(isActive('/eduresource') || isActive('/donationspages')) && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFA239' }}></span>
                            )}
                        </span>
                        
                        {resourcesOpen && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 border-2 shadow-lg rounded-lg py-1.5 w-56 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderColor: '#8CE4FF' }}>
                                <Link 
                                    href="/eduresource" 
                                    className="block px-4 py-2 font-medium text-sm rounded-md mx-1.5"
                                    style={{ ...dropdownItemStyle, color: '#1a1a1a', backgroundColor: 'transparent' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#8CE4FF';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }}
                                >
                                    Educational Resources
                                </Link>
                                <Link 
                                    href="/donationspages" 
                                    className="block px-4 py-2 font-medium text-sm rounded-md mx-1.5"
                                    style={{ ...dropdownItemStyle, color: '#1a1a1a', backgroundColor: 'transparent' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#8CE4FF';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#1a1a1a';
                                    }}
                                >
                                    Donations & Volunteer
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link 
                        href="/FAQ" 
                        className="font-semibold text-sm md:text-base lg:text-lg relative"
                        style={{ 
                            ...navLinkStyle, 
                            color: isActive('/FAQ') ? '#FFA239' : '#1a1a1a',
                            paddingBottom: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFA239'}
                        onMouseLeave={(e) => e.currentTarget.style.color = isActive('/FAQ') ? '#FFA239' : '#1a1a1a'}
                    >
                        FAQ
                        {isActive('/FAQ') && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFA239' }}></span>
                        )}
                    </Link>

                    <Link 
                        href="/AboutUs" 
                        className="font-semibold text-sm md:text-base lg:text-lg relative"
                        style={{ 
                            ...navLinkStyle, 
                            color: isActive('/AboutUs') ? '#FFA239' : '#1a1a1a',
                            paddingBottom: '2px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFA239'}
                        onMouseLeave={(e) => e.currentTarget.style.color = isActive('/AboutUs') ? '#FFA239' : '#1a1a1a'}
                    >
                        About Us
                        {isActive('/AboutUs') && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#FFA239' }}></span>
                        )}
                    </Link>
                </div>

                {/* Search and User Icons - Compact */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                    {isSearchOpen && (
                        // Display the input field if isSearchOpen is true
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Quick Search..."
                                className="w-32 sm:w-40 md:w-44 lg:w-48 p-1.5 sm:p-2 text-sm border-2 rounded-full focus:outline-none focus:ring-2 placeholder:opacity-50"
                                style={{ 
                                    borderColor: '#8CE4FF', 
                                    backgroundColor: '#ffffff',
                                    color: '#1a1a1a'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.outlineColor = '#FFA239';
                                    e.currentTarget.style.borderColor = '#FFA239';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#8CE4FF';
                                }}
                                autoFocus 
                            />
                            {/* Hidden submit button (Enter key works) */}
                            <button type="submit" className="hidden" aria-label="Submit Search"></button>
                        </form>
                    )}
                    
                    {/* The Search Icon that toggles the input field */}
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)} 
                        className="p-1 transition-all duration-200 hover:scale-110 flex-shrink-0 rounded-full hover:bg-[#8CE4FF]/20"
                        aria-label={isSearchOpen ? "Close Search" : "Open Search"}
                    >
                        <Image
                            src="/search2.png" 
                            alt="search icon" 
                            width={32} 
                            height={32}
                            className="object-contain w-5 h-auto sm:w-6 md:w-6 lg:w-7"/>
                    </button>

                    {/* Drop down menu for user with arrow indicator */}
                    <div
                        className="relative"
                        onMouseEnter={() => setUserMenuOpen(true)}
                        onMouseLeave={() => setUserMenuOpen(false)}
                    >
                        <div className="transition-all duration-200 hover:scale-110 cursor-pointer flex-shrink-0 rounded-full hover:bg-[#FEEE91]/30 p-1">
                            <Image
                                src="/user2.png"
                                alt="user icon"
                                width={32}
                                height={32}
                                className="object-contain w-5 h-auto sm:w-6 md:w-6 lg:w-7"
                            />
                        </div>
                        {userMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 border-2 shadow-lg rounded-lg py-1.5 w-48 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderColor: '#8CE4FF' }}>
                                {/* Show different options based on login status */}
                                {isLoggedIn ? (
                                    <>
                                        {/* Show these options when user is logged in */}
                                        <Link 
                                            href="/profile" 
                                            className="block px-4 py-2 font-medium text-sm rounded-md mx-1.5"
                                            style={{ ...dropdownItemStyle, color: '#1a1a1a', backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#8CE4FF';
                                                e.currentTarget.style.color = '#1a1a1a';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#1a1a1a';
                                            }}
                                        >
                                            My Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 font-medium text-sm rounded-md mx-1.5"
                                            style={{ ...dropdownItemStyle, color: '#1a1a1a', backgroundColor: 'transparent', width: 'calc(100% - 12px)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#FF5656';
                                                e.currentTarget.style.color = '#ffffff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#1a1a1a';
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
                                            className="block px-4 py-2 font-medium text-sm rounded-md mx-1.5"
                                            style={{ ...dropdownItemStyle, color: '#1a1a1a', backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#8CE4FF';
                                                e.currentTarget.style.color = '#1a1a1a';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#1a1a1a';
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
            </div>
        </nav>
    );
}