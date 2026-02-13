"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "How has poverty affected the world today?",
            answer: "Global poverty continues to be a significant issue that results in severe consequences. It directly impacts health and nutrition, as many communities lack access to basic necessities such as clean water, sanitation, and sufficient nutritious food, leading to poor health and lower life expectancy. Economically, poverty is linked to food insecurity, stifles community investment, and increases global crises vulnerability to pandemics, climate disasters, and conflicts. Despite progress in some areas, hundreds of millions of people still live on just a few dollars a day."
        },
        {
            question: "Which countries are suffering the most from poverty?",
            answer: (
                <div>
                    <p className="mb-4">The majority of those living in extreme poverty reside in Sub-Saharan Africa, where economic growth is weak and population growth is high. Some countries that have been suffering long-term from high poverty and are facing political instability, conflict, and reliance on subsistence agriculture include: South Sudan, Burundi, Central African Republic, Yemen, and Somalia.</p>
                    <p className="mt-4"><strong>Note:</strong> For the most up-to-date and comprehensive information, we recommend checking the <strong>Statistics</strong> tab above.</p>
                </div>
            )
        },
        {
            question: "How can I donate or help?",
            answer: (
                <div>
                    <p className="mb-2">There are a couple of great options for making donations:</p>
                    <p className="mb-2"><strong>1. Through our website:</strong> You can donate directly through PovertyLens to support our mission and programs.</p>
                    <p><strong>2. External Resources:</strong> Alternatively, you can navigate to the <strong>Resources → Donations & Volunteering</strong> section of our site. From there, simply click on one of the options in the list of reputable organizations focusing on poverty reduction. This will allow you to choose what aligns best with your donation goals.</p>
                </div>
            )
        },
        {
            question: "Where do my donations go if I donate through PovertyLens?",
            answer: (
                <div>
                    <p className="mb-2">If you donate directly through the PovertyLens website, your contribution goes into our general fund and is strategically allocated to support a variety of core programs. These programs focus on the following high-impact areas:</p>
                    <p className="mb-1">1. Affordable Housing & Shelter</p>
                    <p className="mb-1">2. Food Security & Nutrition</p>
                    <p className="mb-1">3. Integrated Health Services</p>
                    <p className="mb-1">4. Education & Workforce Development</p>
                    <p className="mb-1">5. Operational Costs</p>
                </div>
            )
        }
    ];

    return (
        // ============== Marisol Morales Code 1/9/2026 - Dark Mode Background ============== //
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        {/* ============== End Dark Mode Background ============== */}
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-16 lg:py-20">
                    {/* Header Section */}
                    <div className="mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
                                Frequently Asked Questions
                            </span>
                        </h1>
                        {/* ============== Marisol Morales Code 1/9/2026 - Dark Mode Text ============== */}
                        <p className="text-lg" style={{ color: 'var(--color-gray)' }}>
                            Got questions? We've got answers.
                        </p>
                        {/* ============== End Dark Mode Text ============== */}
                    </div>

                    {/* Two Column Section - Text Left, Logo Right */}
                    {/* Added by Marisol 2/4/2026 for updated UI and providing contact form */}
                    <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
                        {/* Left - Description Text */}
                        {/* ============== Marisol Morales Code 1/9/2026 - Dark Mode Text Colors ============== */}
                        <div>
                            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--color-gray)' }}>
                                Find answers to common questions about poverty, our mission, and how you can make a difference.
                            </p>
                            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-gray)' }}>
                                If your question hasn't been answered here, drop us a line or use our{' '}
                                <Link 
                                    href="/ContactUs"
                                    className="underline font-semibold cursor-pointer transition-all hover:underline-offset-4"
                                    style={{ color: '#FFA239' }}
                                >
                                    contact form
                                </Link>
                                . We're here to help!
                            </p>
                        </div>
                        {/* ============== End Dark Mode Text Colors ============== */}

                        {/* Right - Logo/Image */}
                        <div className="flex items-center justify-center">
                            <Image
                                src="/faqicon.png" //log update Reymes 1/30/26
                                alt="World in hands illustration"
                                width={400}
                                height={400}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* FAQ Accordion - Full Width */}
                    <div className="max-w-4xl mx-auto">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                // ============== Marisol Morales Code 1/9/2026 - Dark Mode Border ============== //
                                className="py-6"
                                style={{ borderBottom: '1px solid var(--color-gray-light)' }}
                                // ============== End Dark Mode Border ============== //
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full text-left flex items-start justify-between gap-4 group"
                                >
                                    {/* ============== Marisol Morales Code 1/9/2026 - Dark Mode Question Text ============== */}
                                    <span 
                                        className="font-medium text-lg flex-1"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {faq.question}
                                    </span>
                                    {/* ============== End Dark Mode Question Text ============== */}
                                    <div className="flex-shrink-0 mt-1">
                                        {openIndex === index ? (
                                            <Minus size={20} className="text-orange-500" />
                                        ) : (
                                            <Plus size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                                        )}
                                    </div>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                        openIndex === index ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    {/* ============== Marisol Morales Code 1/9/2026 - Dark Mode Answer Text ============== */}
                                    <div 
                                        className="leading-relaxed pl-0"
                                        style={{ color: 'var(--color-gray-dark)' }}
                                    >
                                        {faq.answer}
                                    </div>
                                    {/* ============== End Dark Mode Answer Text ============== */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}