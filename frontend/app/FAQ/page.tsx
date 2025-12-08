"use client";
import { useState } from "react";
import Image from "next/image";

export default function FAQ(){
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "How has poverty affected the world today?",
            answer: "Global poverty continues to be a significant issue that results in severe consequences. It directly impacts health, and nutrition, as many communities lack access to basic necessities such as clean water, sanitation, and sufficient nutritious food, leading to poor health and lower life expenctantcy. Economically, poverty is linked to food insecurity, stifles community investment, and an increase in global crises vulnerability to pandemics, climate disasters, and conflicts. Despite progress in some areas, hundreds of millions of people still live on just a few dollars a day."
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
                    <p className="mb-2">If you donate directly through the PovertyLens website, your contribution goes into our general fund and is straegically allocated to support a variety of core programs. These programs focus on the following high-impact areas:</p>
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
        <div className="min-h-screen">
            <h1 className="pt-10 pb-1 text-center text-[70px] text-[#623100] font-black">
                Frequently Asked Questions
            </h1>

            {/* Two Column Layout */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-12 items-start">
                
                {/* Left Column - World Image */}
                <div className="flex-[2]">
                    <Image
                        src="/faqicon.png"
                        alt="World in hands illustration"
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                </div>

                {/* Right Column - FAQ Accordion */}
                <div className="flex-[3] space-y-3">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index}
                            className="bg-[#C8AB8F] rounded-lg overflow-hidden"
                        >
                            {/* Question Button */}
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-[#D8B99B] transition-colors"
                            >
                                <span className="text-[20px] font-bold text-[#623100]">
                                    {faq.question}
                                </span>
                                <span className="text-[24px] text-[#623100]">
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>

                            {/* Answer (only shows when open) */}
                            {openIndex === index && (
                                <div className="px-8 py-6 bg-white border-t border-[#D0C8BD]">
                                    <div className="text-[18px] text-[#623100] leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}