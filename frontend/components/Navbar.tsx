"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle'; // Added by marisol morales - 3/7/2026 - restore theme toggle for logged-out users

export default function Navbar() {
    // Hooks initialization
    const router = useRouter();
    const pathname = usePathname();
    
    // Code for the dropdown menus (Resources and User Menu)
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Close resources dropdown if clicking outside
            if (resourcesOpen && !target.closest('.resources-dropdown')) {
                setResourcesOpen(false);
            }
            // Close user menu if clicking outside
            if (userMenuOpen && !target.closest('.user-menu')) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [resourcesOpen, userMenuOpen]);

    // Handle logout function
    const handleLogout = async () => {
        // Added by Marisol - 03/05/2026 - log the logout before clearing localStorage
        const email = localStorage.getItem('userEmail');
        if (email) {
            try {
                await fetch('http://localhost:4000/api/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
            } catch (err) {
                console.error('Error logging logout:', err);
            }
        }
        // End of addition by Marisol - 03/05/2026

        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        localStorage.setItem('contrast', 'normal');         // Reset high contrast mode to normal on logout - Added by Damon 3/7/2026
        setIsLoggedIn(false);
        setUserMenuOpen(false);
        // Force a full page reload to reset all state
        window.location.href = '/'; 
    };

    // Search logic: Handles the form submission (when Enter is pressed)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            
            // Check for known exact navigation pages
            if (query === 'home') {
                router.push('/');
                setSearchQuery('');
                return;
            }
            
            // Proceed to the general search results page
            const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
            router.push(searchUrl);
            setSearchQuery('');
        }
    };

    // Helper function to check if a path is active
    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        // ============== Marisol Morales Code 1/9/2026 - DARK MODE NAVBAR - Using CSS Variables ============== //
        <nav 
            className="sticky top-0 z-50 border-b shadow-sm transition-colors duration-200"
            style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--color-gray-light)'
            }}
        >
        {/* ============== End dark mode nav styles ============== */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                <div className="flex items-center h-16 relative">
                    {/* Logo & Theme Toggle - Left */}
                    <div className="flex items-center gap-3 flex-shrink-0 z-10">
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <Image
                                src="/logov3.png" 
                                alt="PovertyLens Logo" 
                                width={150} 
                                height={150}
                                className="object-contain"/>
                        </Link>
                        {/* Added by marisol morales - 3/7/2026 - show theme toggle next to logo when logged out */}
                        {!isLoggedIn && <ThemeToggle showContrast={false} />}
                        {/* End addition */}
                    </div>

                    {/* Desktop Navigation Links - Absolutely Centered */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center space-x-12">
                            <Link 
                                href="/" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 dark:text-gray-200 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                Home
                            </Link>

                            <Link 
                                href="/statistics" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/statistics') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 dark:text-gray-200 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                Statistics
                            </Link>
                            
                            {/* Resources Dropdown */}
                            <div className="relative resources-dropdown">
                                <button
                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                    className={`flex items-center gap-1 font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                        (isActive('/eduresource') || isActive('/donationspages'))
                                            ? 'text-[#FFA239] border-[#FFA239]' 
                                            : 'border-transparent hover:text-[#FFA239]'
                                    }`}
                                    style={{ 
                                        color: (isActive('/eduresource') || isActive('/donationspages')) 
                                            ? '#FFA239' 
                                            : 'var(--foreground)' 
                                    }}
                                >
                                    Resources
                                    <ChevronDown 
                                        className={`w-4 h-4 transition-transform ${
                                            resourcesOpen ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </button>
                                
                                {resourcesOpen && (
                                    <div 
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-lg shadow-lg py-2 z-50 transition-colors"
                                        style={{
                                            backgroundColor: 'var(--background)',
                                            border: '1px solid var(--color-gray-light)'
                                        }}
                                    >
                                        <Link 
                                            href="/eduresource" 
                                            className="block px-4 py-2.5 text-sm transition-all duration-200"
                                            style={{ color: 'var(--foreground)' }}
                                            onMouseEnter={(e) => {
                                                const isDark = document.documentElement.classList.contains('dark');
                                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={() => setResourcesOpen(false)}
                                        >
                                            Educational Resources
                                        </Link>
                                        <Link 
                                            href="/donationspages" 
                                            className="block px-4 py-2.5 text-sm transition-all duration-200"
                                            style={{ color: 'var(--foreground)' }}
                                            onMouseEnter={(e) => {
                                                const isDark = document.documentElement.classList.contains('dark');
                                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={() => setResourcesOpen(false)}
                                        >
                                            Donations & Volunteer
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link 
                                href="/FAQ" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/FAQ') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 dark:text-gray-200 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                FAQ
                            </Link>

                            <Link 
                                href="/AboutUs" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/AboutUs') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 dark:text-gray-200 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                About Us
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Icons - Desktop */}
                    <div className="hidden lg:flex items-center ml-auto space-x-3">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent text-sm transition-colors"
                                style={{
                                    backgroundColor: 'var(--color-gray-light)',
                                    color: 'var(--foreground)',
                                    borderColor: 'var(--color-gray-light)'
                                }}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </form>

                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* User Profile Menu */}
                        <div className="relative user-menu">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center hover:shadow-lg transition-shadow"
                            >
                                <Image
                                    src="/profileicon.png"
                                    alt="user icon"
                                    width={30}
                                    height={30}
                                    className="object-contain"
                                />
                            </button>
                            
                            {userMenuOpen && (
                                <div 
                                    className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-2 z-50 transition-colors"
                                    style={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--color-gray-light)'
                                    }}
                                >
                                    {isLoggedIn ? (
                                        <>
                                            <Link 
                                                href="/profile" 
                                                className="block px-4 py-2.5 text-sm transition-all duration-200"
                                                style={{ color: 'var(--foreground)' }}
                                                onMouseEnter={(e) => {
                                                    const isDark = document.documentElement.classList.contains('dark');
                                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Account Settings
                                            </Link>
                                            {/*Added by Marisol to keep track of user activity - Start */}
                                            <Link 
                                                href="/accountActivity" 
                                                className="block px-4 py-2.5 text-sm transition-all duration-200"
                                                style={{ color: 'var(--foreground)' }}
                                                onMouseEnter={(e) => {
                                                    const isDark = document.documentElement.classList.contains('dark');
                                                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Account Activity 
                                            </Link>
                                            {/*Added by Marisol to keep track of user activity - End */}
                                            <hr style={{ borderColor: 'var(--color-gray-light)' }} className="my-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-all duration-200"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 86, 86, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link 
                                            href="/signin" 
                                            className="block px-4 py-2.5 text-sm transition-all duration-200"
                                            style={{ color: 'var(--foreground)' }}
                                            onMouseEnter={(e) => {
                                                const isDark = document.documentElement.classList.contains('dark');
                                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Sign In/Login
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-[#FFA239] transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t py-4" style={{ borderColor: 'var(--color-gray-light)' }}>
                        <div className="flex flex-col space-y-4">
                            <Link 
                                href="/" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/') ? 'text-[#FFA239]' : 'text-gray-700 dark:text-gray-200'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <Link 
                                href="/statistics" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/statistics') ? 'text-[#FFA239]' : 'text-gray-700 dark:text-gray-200'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Statistics
                            </Link>

                            {/* Mobile Resources Section */}
                            <div>
                                <button
                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                    className="flex items-center justify-between w-full font-medium text-sm text-gray-700 dark:text-gray-200 px-2 py-2"
                                >
                                    Resources
                                    <ChevronDown 
                                        className={`w-4 h-4 transition-transform ${
                                            resourcesOpen ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </button>
                                {resourcesOpen && (
                                    <div className="ml-4 mt-2 space-y-2">
                                        <Link 
                                            href="/eduresource" 
                                            className="block px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#FFA239]"
                                            onClick={() => {
                                                setResourcesOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Educational Resources
                                        </Link>
                                        <Link 
                                            href="/donationspages" 
                                            className="block px-2 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#FFA239]"
                                            onClick={() => {
                                                setResourcesOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Donations & Volunteer
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link 
                                href="/FAQ" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/FAQ') ? 'text-[#FFA239]' : 'text-gray-700 dark:text-gray-200'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </Link>

                            <Link 
                                href="/AboutUs" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/AboutUs') ? 'text-[#FFA239]' : 'text-gray-700 dark:text-gray-200'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>


                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="relative px-2 md:hidden">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent text-sm transition-colors"
                                    style={{
                                        backgroundColor: 'var(--color-gray-light)',
                                        color: 'var(--foreground)',
                                        borderColor: 'var(--color-gray-light)'
                                    }}
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}