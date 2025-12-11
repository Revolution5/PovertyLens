"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';

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
                <h1 className="text-[50px] font-bold text-[#623100] mb-4">
                    Search Results
                </h1>
                
                <p className="text-[20px] text-[#623100] mb-8">
                    Results for: <span className="font-bold">&quot;{query}&quot;</span>
                </p>

                {results.length > 0 ? (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <Link key={result.path} href={result.path}>
                                <div className="p-6 bg-[#D9D1B7] rounded-lg hover:bg-[#C8AB8F] transition-colors cursor-pointer border-l-4 border-[#AC7F5E]">
                                    <h2 className="text-[28px] font-bold text-[#623100] mb-2">
                                        {result.title}
                                    </h2>
                                    <p className="text-[18px] text-[#623100]">
                                        {result.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-[24px] text-[#623100] mb-6">
                            No results found for &quot;{query}&quot;
                        </p>
                        <p className="text-[18px] text-[#623100] mb-8">
                            Try searching for:
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {NAVIGATION_PAGES.map((page: SearchResult) => (
                                <Link key={page.path} href={page.path}>
                                    <button className="px-4 py-2 bg-[#AC7F5E] text-[#623100] rounded-lg hover:bg-[#C9956E] transition-colors font-semibold">
                                        {page.title}
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-[#AC7F5E]">
                    <Link href="/">
                        <button className="px-6 py-3 bg-[#AC7F5E] text-[#623100] rounded-lg hover:bg-[#C9956E] transition-colors font-semibold text-[18px]">
                            ← Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
