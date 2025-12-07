import Image from 'next/image';

export default function Home() {

    // display this for if the user is not logged in
    return (
        <div className="min-h-screen">
                <h1 className="pt-10 pb-1 text-center text-[70px] text-[#623100] font-black ">
                    Welcome To PovertyLens!
                </h1>
                
                {/* Creating the columns*/}
                <div className="flex gap-10 px-10">
                    {/* Left column - Introductory text */}
                    <div className="flex-1">
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
                    <div className="flex-1 flex justify-center items-start mt-15">
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