"use client";
import { useState , useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    // state to track if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    // state to check the logged in user username
    const [username, setUsername] = useState("User"); 

    // Check if user is logged in when page loads
    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            setIsLoggedIn(true);
            // Extract username from email (everything before @)
            const name = userEmail.split('@')[0];
            setUsername(name);
        }
    }, []);

    if (isLoggedIn) {
        // display this for is the user is logged in
        return (
            <div className="min-h-screen">
                <h1 className="pt-10 pb-1 text-center text-[70px] text-[#623100] font-black">
                    Hello, {username}!
                </h1>
                <h1 className="text-center text-[70px] text-[#623100] font-black">
                    Welcome back to PovertyLens!
                </h1>

                {/* Four interactive buttons */}
                <div className="flex gap-8 justify-center pt-16">
                    <Link href="/upload-story">
                        <button className="bg-[#AC7F5E] px-12 py-12 rounded-3xl text-[#623100] text-[30px] font-semibold hover:bg-[#C9956E] transition-colors">
                            Upload a story
                        </button>
                    </Link>

                    <Link href="/view-stories">
                        <button className="bg-[#AC7F5E] px-12 py-12 rounded-3xl text-[#623100] text-[30px] font-semibold hover:bg-[#C9956E] transition-colors">
                            View your stories
                        </button>
                    </Link>

                    <Link href="/play-freerice">
                        <button className="bg-[#AC7F5E] px-12 py-12 rounded-3xl text-[#623100] text-[30px] font-semibold hover:bg-[#C9956E] transition-colors">
                            Play FreeRice
                        </button>
                    </Link>

                    <Link href="/donations-volunteer">
                        <button className="bg-[#AC7F5E] px-12 py-12 rounded-3xl text-[#623100] text-[30px] font-semibold hover:bg-[#C9956E] transition-colors">
                            Donate Now!
                        </button>
                    </Link>
                </div>
                {/* Thank you message */}
                <div className="text-center pt-16">
                    <h3 className="text-center text-[70px] text-[#623100] font-black">
                        Thank you for coming back!
                    </h3>
                </div>
            </div>
        )
    }

    // display this for if the user is not logged in
    return (
        <div className="min-h-screen">
                <h1 className="pt-10 pb-1 text-center text-[70px] text-[#623100] font-black ">
                    Welcome To PovertyLens!
                </h1>
                
                {/* Creating the columns*/}
                <div className="flex gap-10 px-10">
                    {/* Left column - Introductory text */}
                    <div className="flex-[11]">
                        <p className="text-[#623100] font-bold text-[40px] mb-4">Our Mission:</p>
                        <p className="text-[#623100] text-[30px] mb-4">
                            Poverty affects millions worldwide, yet it remains 
                            one of the most misunderstood and underrepresented global issues.
                            PovertyLens hopes to bridges this gap by transforming complex data and real-world stories into meaningful,
                            easy-to-understand insights.
                        </p>
                        <p className="text-[#623100] text-[30px]">
                            We hope to empower everyone, whether that’s supporting global initiatives, 
                            donating, or spreading awareness within their own communities.
                        </p>
                    </div>

                    {/* Right column - Logo */}
                    <div className="flex-[9] flex justify-center items-start mt-15">
                            <Image
                                src="/logov2.png" 
                                alt="PovertyLens Logo" 
                                width={500} 
                                height={500}
                                className="object-contain"/>
                    </div>
                </div>
        </div>
    );
}