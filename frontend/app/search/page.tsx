"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';

interface SearchResult {
    title: string;
    path: string;
    description: string;
}

const NAVIGATION_PAGES: SearchResult[] = [
    { title: 'Home', path: '/', description: 'Welcome to PovertyLens' },
    { title: 'Statistics', path: '/statistics', description: 'View poverty statistics and data' },
    { title: 'Educational Resources', path: '/eduresource', description: 'Learn about global poverty' },
    { title: 'Donations & Volunteer', path: '/donationspages', description: 'Support our mission' },
    { title: 'FAQ', path: '/FAQ', description: 'Frequently asked questions' },
    { title: 'About Us', path: '/AboutUs', description: 'Learn about PovertyLens' },
    { title: 'Upload Story', path: '/uploadstory', description: 'Share your story' },
    { title: 'View Stories', path: '/viewstories', description: 'Read community stories' },
    { title: 'Profile', path: '/profile', description: 'Manage your profile' },
];

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    // Added by Marisol 1/12/2026 for Dark Mode Support 
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));

        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);
    // Added by Marisol 1/12/2026 for Dark Mode Support
    const results = useMemo(() => {
        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            
            // Search through navigation pages
            return NAVIGATION_PAGES.filter(page =>
                page.title.toLowerCase().includes(lowerQuery) ||
                page.description.toLowerCase().includes(lowerQuery)
            );
        }
        return [];
    }, [query]);

    return (
        <div className="min-h-screen px-10 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-[50px] font-bold mb-4" style={{ color: isDark ? '#FFB660' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                    Search Results
                </h1>
                
                <p className="text-[20px] mb-8" style={{ color: isDark ? '#FFB660' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                    Results for: <span className="font-bold">&quot;{query}&quot;</span>
                </p>

                {results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <Link key={result.path} href={result.path}>
                                <div 
                                    className="p-6 rounded-lg transition-colors cursor-pointer border-l-4"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(217, 209, 183, 0.1)' : '#D9D1B7', // Changed by Marisol 1/12/2026 for Dark Mode Support
                                        borderColor: isDark ? '#AC7F5E' : '#AC7F5E'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(200, 171, 143, 0.2)' : '#C8AB8F'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(217, 209, 183, 0.1)' : '#D9D1B7'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                                    }}
                                >
                                    <h2 className="text-[28px] font-bold mb-2" style={{ color: isDark ? '#FFB660' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                                        {result.title}
                                    </h2>
                                    <p className="text-[18px]" style={{ color: isDark ? '#E0D5C7' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                                        {result.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-[24px] mb-6" style={{ color: isDark ? '#FFB660' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                            No results found for &quot;{query}&quot;
                        </p>
                        <p className="text-[18px] mb-8" style={{ color: isDark ? '#E0D5C7' : '#623100' }}> {/* Changed by Marisol 1/12/2026 for Dark Mode Support */ }
                            Try searching for:
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {NAVIGATION_PAGES.map((page: SearchResult) => (
                                <Link key={page.path} href={page.path}>
                                    <button 
                                        className="px-4 py-2 rounded-lg transition-colors font-semibold"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(172, 127, 94, 0.3)' : '#AC7F5E', // Changed by Marisol 1/12/2026 for Dark Mode Support
                                            color: isDark ? '#FFB660' : '#623100' // Changed by Marisol 1/12/2026 for Dark Mode Support
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 149, 110, 0.4)' : '#C9956E'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(172, 127, 94, 0.3)' : '#AC7F5E'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                                        }}
                                    >
                                        {page.title}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div 
                    className="mt-12 pt-8 border-t"
                    style={{ borderColor: isDark ? 'rgba(172, 127, 94, 0.3)' : '#AC7F5E' }} // Changed by Marisol 1/12/2026 for Dark Mode Support
                >
                    <Link href="/">
                        <button 
                            className="px-6 py-3 rounded-lg transition-colors font-semibold text-[18px]"
                            style={{
                                backgroundColor: isDark ? 'rgba(172, 127, 94, 0.3)' : '#AC7F5E', // Changed by Marisol 1/12/2026 for Dark Mode Support
                                color: isDark ? '#FFB660' : '#623100' // Changed by Marisol 1/12/2026 for Dark Mode Support
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(201, 149, 110, 0.4)' : '#C9956E'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(172, 127, 94, 0.3)' : '#AC7F5E'; // Changed by Marisol 1/12/2026 for Dark Mode Support
                            }}
                        >
                            ← Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}