import Image from "next/image";
import { BarChart3, Heart, HandHeart } from 'lucide-react';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-8 px-6 bg-gradient-to-br from-[#8CE4FF]/10 via-white to-[#FEEE91]/10">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-7xl mb-6 bg-gradient-to-r from-[#FF5656] via-[#FFA239] to-[#FF5656] bg-clip-text text-transparent font-black">
                        About Us
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#8CE4FF] via-[#FFA239] to-[#FF5656] mx-auto rounded-full"></div>
                </div>
            </section>

            {/* Mission Section - Text Left, Image Right */}
            <section className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Text on the left */}
                        <div className="space-y-8">
                            <p className="text-xl leading-relaxed text-gray-700">
                                The <span className="text-[#FF5656] font-bold">PovertyLens</span> Team is a small, but determined group of college students who see global poverty as a massive, overwhelming issue. We felt that the people need clear, actionable pathways to get involved to combat the issue of poverty.
                            </p>
                            <p className="text-xl leading-relaxed text-gray-700">
                                The scale of the problem creates a fog of indifference, and PovertyLens aims to clear that fog. We built this website to bridge the gap between you, the user, and the urgent issue of poverty. We want to be the connection that turns curiosity and sympathy into concrete action.
                            </p>
                        </div>

                        {/* Placeholder shape on the right */}
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-2xl shadow-xl h-[500px] bg-gradient-to-br from-[#8CE4FF]/30 via-[#FEEE91]/20 to-[#FFA239]/30 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <Heart className="w-24 h-24 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Image Placeholder</p>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#FFA239] to-[#FF5656] rounded-2xl -z-10"></div>
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] rounded-2xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-16 px-6 bg-gradient-to-br from-[#8CE4FF]/5 to-[#FEEE91]/5">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-5xl mb-12 text-center text-[#FF5656] font-bold">
                        What We Do
                    </h2>
                    
                    <p className="text-xl leading-relaxed text-gray-700 mb-10 text-center max-w-4xl mx-auto">
                        PovertyLens is designed to be a straightforward platform for understanding and addressing global poverty. We focus on:
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#8CE4FF]/20 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#8CE4FF] to-[#8CE4FF]/60 rounded-xl flex items-center justify-center mb-6">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-lg leading-relaxed text-gray-700">
                                Providing clear, digestible statistics and up-to-date information so you can understand where the need is greatest.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FEEE91]/30 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FEEE91] to-[#FFA239] rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-lg leading-relaxed text-gray-700">
                                Sharing powerful, authentic narratives that show the real impact of poverty and the incredible resilience of those facing it.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFA239]/20 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FFA239] to-[#FF5656] rounded-xl flex items-center justify-center mb-6">
                                <HandHeart className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-lg leading-relaxed text-gray-700">
                                Offering verified, easy-to-use pathways to donate, volunteer, or even just play a free game (yes, FreeRice works!) to make a difference.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className="text-xl leading-relaxed text-gray-700">
                            We may not have all the answers, but we commit to ensuring you have all the facts. We do the research; you make the impact.
                        </p>
                        <p className="text-xl leading-relaxed text-gray-600 italic">
                            Thank you for looking through our Lens. Together, we can make all the difference.
                        </p>
                    </div>
                </div>
            </section>

            {/* Meet the Team Section */}
            <section className="py-16 px-6 bg-gradient-to-br from-white via-[#8CE4FF]/5 to-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-6xl mb-12 text-center bg-gradient-to-r from-[#FF5656] to-[#FFA239] bg-clip-text text-transparent font-bold">
                        Meet the Team!
                    </h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                        {/* Team Member 1 - Damon */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/damon.png"
                                    alt="Damon Boone"
                                    width={250}
                                    height={333}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5656]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl mb-1 text-gray-900 font-bold">
                                    Damon Boone
                                </h3>
                                <p className="text-base text-[#FFA239]">
                                    Developer
                                </p>
                            </div>
                        </div>

                        {/* Team Member 2 - Marisol */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/marisol.png"
                                    alt="Marisol Morales"
                                    width={250}
                                    height={333}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5656]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl mb-1 text-gray-900 font-bold">
                                    Marisol Morales
                                </h3>
                                <p className="text-base text-[#FFA239]">
                                    Developer
                                </p>
                            </div>
                        </div>

                        {/* Team Member 3 - Reymes */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/reymes.png"
                                    alt="Reymes Olide"
                                    width={250}
                                    height={333}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5656]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl mb-1 text-gray-900 font-bold">
                                    Reymes Olide
                                </h3>
                                <p className="text-base text-[#FFA239]">
                                    Developer
                                </p>
                            </div>
                        </div>

                        {/* Team Member 4 - Daniel */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/daniel.png"
                                    alt="Daniel Jose Quizon"
                                    width={250}
                                    height={333}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5656]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl mb-1 text-gray-900 font-bold">
                                    Daniel Jose Quizon
                                </h3>
                                <p className="text-base text-[#FFA239]">
                                    Developer
                                </p>
                            </div>
                        </div>

                        {/* Team Member 5 - Christella */}
                        <div className="group">
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4] bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/christella.png"
                                    alt="Christella Marie Perez Taguicana"
                                    width={250}
                                    height={333}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#FF5656]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl mb-1 text-gray-900 font-bold">
                                    Christella Marie Perez Taguicana
                                </h3>
                                <p className="text-base text-[#FFA239]">
                                    Developer
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}