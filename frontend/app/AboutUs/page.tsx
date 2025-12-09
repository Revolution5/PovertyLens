import Image from "next/image";

export default function AboutUs() {
    return (
        <div className="min-h-screen px-16 py-10">
            {/* Title */}
            <h1 className="text-center text-[70px] text-[#623100] font-black mb-4">
                About Us
            </h1>

            {/* Content */}
            <div>
                <p className="text-[#623100] text-[25px] leading-relaxed mb-2">
                    The <strong>PovertyLens</strong> Team is a small, but determined group of college students who see global poverty as a massive, overwhelming issue. We felt that the people need clear, actionable pathways to get involved to combat the issue of poverty.
                </p>

                <p className="text-[#623100] text-[25px] leading-relaxed mb-3">
                    The scale of the problem creates a fog of indifference, and PovertyLens aims to clear that fog. We built this website to bridge the gap between you, the user, and the urgent issue of poverty. We want to be the connection that turns curiosity and sympathy into concrete action.
                </p>

                <h2 className="text-[#623100] text-[28px] font-bold mb-4">
                    What We Do
                </h2>

                <p className="text-[#623100] text-[25px] leading-relaxed mb-2">
                    PovertyLens is designed to be a straightforward platform for understanding and addressing global poverty. We focus on:
                </p>

                <ul className="list-disc ml-6 space-y-2 text-[#623100] text-[25px] leading-relaxed mb-2">
                    <li>Providing clear, digestible statistics and up-to-date information so you can understand where the need is greatest.</li>
                    <li>Sharing powerful, authentic narratives that show the real impact of poverty — and the incredible resilience of those facing it.</li>
                    <li>Offering verified, easy-to-use pathways to donate, volunteer, or even just play a free game (yes, FreeRice works!) to make a difference.</li>
                </ul>

                <p className="text-[#623100] text-[25px] leading-relaxed mb-3">
                    We may not have all the answers, but we commit to ensuring you have all the facts. We do the research; you make the impact.
                </p>

                <p className="text-[#623100] text-[25px] leading-relaxed">
                    Thank you for looking through our Lens. Together, we can make all the difference.
                </p>
            </div>

            {/* Meet the team content*/}
            <div className="mt-10">
                <h2 className="text-[#623100] text-[50px] font-bold mb-8 text-center">
                    Meet the Team!
                </h2>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Team Member 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[250px] overflow-hidden mb-4"> 
                            <Image
                                src="/damon.png"
                                alt="Damon Boone"
                                width={250}
                                height={250}
                                className="object-cover w-full h-full"
                            />
                        </div> 
                        <h3 className="text-[#623100] text-[20px] md:text-[22px] font-bold text-center">Damon Boone</h3>
                        <p className="text-[#623100] text-[16px] md:text-[18px]">Developer</p>
                    </div>
                    {/* Team Member 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[250px] overflow-hidden mb-4"> 
                            <Image
                                src="/marisol.png"
                                alt="Marisol Morales"
                                width={250}
                                height={250}
                                className="object-cover w-full h-full"
                            />
                        </div> 
                        <h3 className="text-[#623100] text-[20px] md:text-[22px] font-bold text-center">Marisol Morales</h3>
                        <p className="text-[#623100] text-[16px] md:text-[18px]">Developer</p>
                    </div>
                    {/* Team Member 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[250px] overflow-hidden mb-4"> 
                            <Image
                                src="/reymes.png"
                                alt="Reymes Olide"
                                width={250}
                                height={250}
                                className="object-cover w-full h-full"
                            />
                        </div> 
                        <h3 className="text-[#623100] text-[20px] md:text-[22px] font-bold text-center">Reymes Olide</h3>
                        <p className="text-[#623100] text-[16px] md:text-[18px]">Developer</p>
                    </div>
                    {/* Team Member 4 */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[250px] overflow-hidden mb-4"> 
                            <Image
                                src="/daniel.png"
                                alt="Daniel Jose Quizon"
                                width={250}
                                height={250}
                                className="object-cover w-full h-full"
                            />
                        </div> 
                        <h3 className="text-[#623100] text-[20px] md:text-[22px] font-bold text-center">Daniel Jose Quizon</h3>
                        <p className="text-[#623100] text-[16px] md:text-[18px]">Developer</p>
                    </div>
                    {/* Team Member 5 */}
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-[250px] overflow-hidden mb-4"> 
                            <Image
                                src="/christella.png"
                                alt="Christella Marie Perez Taguicana"
                                width={250}
                                height={250}
                                className="object-cover w-full h-full"
                            />
                        </div> 
                        <h3 className="text-[#623100] text-[20px] md:text-[22px] font-bold text-center">Christella Marie Perez Taguicana</h3>
                        <p className="text-[#623100] text-[16px] md:text-[18px]">Developer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}