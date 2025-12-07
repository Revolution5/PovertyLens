"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    // Code for the dropdown menus (Resources and User Menu)
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Add state to track if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in on component mount
    useEffect(() => {
        // Check if user is logged in
        const userEmail = localStorage.getItem('userEmail');
        setIsLoggedIn(!!userEmail);
    }, []);

    // Handle logout function
    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        window.location.href = '/';
    };

    return (
        <nav className="flex items-center justify-between px-10 py-5 bg-[#D9D1B7] h-25">
            <div className="flex items-center">
                <Link href="/">
                    <Image
                        src="/logov2.png" 
                        alt="PovertyLens Logo" 
                        width={120} 
                        height={120}
                        className="object-contain"/>
                </Link>
            </div>

            <div className="flex gap-12 items-center">
                <Link href="/" className="text-[#623100] font-bold text-[30px] hover:opacity-70 transition-opacity">
                    Home
                </Link>

                <Link href="/statistics" className="text-[#623100] font-bold text-[30px] hover:opacity-70 transition-opacity">
                    Statistics
                </Link>

                { /* Dropdown Menu for Resources */} 
                <div
                    className="relative"
                    onMouseEnter={() => setResourcesOpen(true)}
                    onMouseLeave={() => setResourcesOpen(false)}
                >
                    <span className="text-[#623100] font-bold text-[30px] hover:opacity-70 transition-opacity cursor-pointer">
                        Resources
                    </span>
                    
                    {resourcesOpen && (
                        <div className="absolute top-full left-0 mt-0 bg-[#C8AB8F] shadow-lg rounded-lg py-2 w-56 z-50">
                            <Link href="/educationalresources" className="block px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors">
                                Educational Resources
                            </Link>
                            <Link href="/donationsandvolunteer" className="block px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors">
                                Donations & Volunteer
                            </Link>
                        </div>
                    )}
                </div>

                <Link href="/FAQ" className="text-[#623100] font-bold text-[30px] hover:opacity-70 transition-opacity">
                    FAQ
                </Link>

                <Link href="AboutUs" className="text-[#623100] font-bold text-[30px] hover:opacity-70 transition-opacity">
                    About Us
                </Link>

                <Link href="/search" className="hover:opacity-70 transition-opacity">
                    <Image
                        src="/search.png" 
                        alt="search icon" 
                        width={45} 
                        height={45}
                        className="object-contain"/>
                </Link>
            
                { /* Drop down menu for user*/}
                <div
                    className="relative"
                    onMouseEnter={() => setUserMenuOpen(true)}
                    onMouseLeave={() => setUserMenuOpen(false)}
                >
                    <div className="hover:opacity-70 transition-opacity cursor-pointer">
                        <Image
                            src="/user.png"
                            alt="user icon"
                            width={45}
                            height={45}
                            className="object-contain"
                        />
                    </div>
                    {userMenuOpen && (
                        <div className="absolute top-full right-0 mt-0.25 bg-[#C8AB8F] shadow-lg rounded-lg py-2 w-48 z-50">
                            {/* Show different options based on login status */}
                            {isLoggedIn ? (
                                <>
                                    {/* Show these options when user is logged in */}
                                    <Link href="/profile" className="block px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors">
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Show these options when user is NOT logged in */}
                                    <Link href="/signin" className="block px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors">
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