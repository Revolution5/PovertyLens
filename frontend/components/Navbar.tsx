"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

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
    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
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
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                <div className="flex items-center h-16 relative">
                    {/* Logo - Left */}
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0 z-10">
                        <Image
                            src="/logov3.png" 
                            alt="PovertyLens Logo" 
                            width={45} 
                            height={45}
                            className="object-contain"/>
                    </Link>

                    {/* Desktop Navigation Links - Absolutely Centered */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center space-x-12">
                            <Link 
                                href="/" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                Home
                            </Link>

                            <Link 
                                href="/statistics" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/statistics') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 border-transparent hover:text-[#FFA239]'
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
                                            : 'text-gray-700 border-transparent hover:text-[#FFA239]'
                                    }`}
                                >
                                    Resources
                                    <ChevronDown 
                                        className={`w-4 h-4 transition-transform ${
                                            resourcesOpen ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </button>
                                
                                {resourcesOpen && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <Link 
                                            href="/eduresource" 
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEEE91]/30 transition-colors"
                                            onClick={() => setResourcesOpen(false)}
                                        >
                                            Educational Resources
                                        </Link>
                                        <Link 
                                            href="/donationspages" 
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FEEE91]/30 transition-colors"
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
                                        : 'text-gray-700 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                FAQ
                            </Link>

                            <Link 
                                href="/AboutUs" 
                                className={`font-medium text-sm transition-colors pb-1 border-b-2 whitespace-nowrap ${
                                    isActive('/AboutUs') 
                                        ? 'text-[#FFA239] border-[#FFA239]' 
                                        : 'text-gray-700 border-transparent hover:text-[#FFA239]'
                                }`}
                            >
                                About Us
                            </Link>
                        </div>
                    </div>

                    {/* Right Section: Search and Profile */}
                    <div className="flex items-center gap-4 flex-shrink-0 ml-auto z-10">
                        {/* Persistent Search Bar - Hidden on mobile */}
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent focus:bg-white transition-all w-52 text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </form>
                        
                        {isLoggedIn && <NotificationBell />}
                        
                        {/* Profile Button with Dropdown */}
                        <div className="relative user-menu">
                            <button 
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center hover:shadow-lg transition-shadow"
                            >
                                <Image
                                    src="/user2.png"
                                    alt="user icon"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                            </button>
                            
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {isLoggedIn ? (
                                        <>
                                            <Link 
                                                href="/profile" 
                                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Account Settings
                                            </Link>
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link 
                                            href="/signin" 
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                            className="lg:hidden p-2 text-gray-700 hover:text-[#FFA239] transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-4">
                        <div className="flex flex-col space-y-4">
                            <Link 
                                href="/" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/') ? 'text-[#FFA239]' : 'text-gray-700'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>

                            <Link 
                                href="/statistics" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/statistics') ? 'text-[#FFA239]' : 'text-gray-700'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Statistics
                            </Link>

                            {/* Mobile Resources Section */}
                            <div>
                                <button
                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                    className="flex items-center justify-between w-full font-medium text-sm text-gray-700 px-2 py-2"
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
                                            className="block px-2 py-2 text-sm text-gray-600 hover:text-[#FFA239]"
                                            onClick={() => {
                                                setResourcesOpen(false);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            Educational Resources
                                        </Link>
                                        <Link 
                                            href="/donationspages" 
                                            className="block px-2 py-2 text-sm text-gray-600 hover:text-[#FFA239]"
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
                                    isActive('/FAQ') ? 'text-[#FFA239]' : 'text-gray-700'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </Link>

                            <Link 
                                href="/AboutUs" 
                                className={`font-medium text-sm transition-colors px-2 py-2 ${
                                    isActive('/AboutUs') ? 'text-[#FFA239]' : 'text-gray-700'
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
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8CE4FF] focus:border-transparent text-sm"
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}