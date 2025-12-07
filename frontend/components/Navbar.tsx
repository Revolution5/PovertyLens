"use client";
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    // Code for the dropdown menus (Resources and User Menu)
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

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
                        <div className="absolute top-full right-0 mt-0.25 bg-[#C8AB8F] shadow-lg rounded-lg py-2 w-40 z-50">
                            <Link href="/signin" className="block px-4 py-2 text-[#623100] hover:bg-[#D8B99B] transition-colors">
                                Sign In/Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}