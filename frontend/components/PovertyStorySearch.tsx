//Poverty rate search component - added by Damon 3/6/2026
"use client";

import { useState } from "react";

type Story = {
  _id: string;
  title: string;
  country?: string | null;
  storyText: string;
  createdAt?: string;
  displayName?: boolean;
  displayPhoto?: boolean;
  userEmail?: string | null;
  archived?: boolean;
};

type UserProfile = {
  email: string;
  username: string;
  profileImage?: string | null;
  bannerImage?: string | null;
};

type Props = {
  povertyThreshold: string;
  setPovertyThreshold: (value: string) => void;
  thresholdLoading: boolean;
  thresholdError: string;
  filteredStories: Story[];
  filteredPage: number;
  setFilteredPage: (page: number) => void;
  handleThresholdSearch: () => void;
  userProfilesCache: Record<string, UserProfile>;
  setFilteredStories: (stories: Story[]) => void;
  setThresholdError: (error: string) => void;
  StoryCard: React.ComponentType<{
    story: Story;
    userProfile?: UserProfile | null;
  }>;
};

const STORIES_PER_PAGE = 6;

export default function PovertyStorySearch({
  povertyThreshold,
  setPovertyThreshold,
  thresholdLoading,
  thresholdError,
  filteredStories,
  filteredPage,
  setFilteredPage,
  handleThresholdSearch,
  userProfilesCache,
  setFilteredStories,
  setThresholdError,
  StoryCard,
}: Props) {
  const totalPages = Math.ceil(filteredStories.length / STORIES_PER_PAGE);
  const paginated = filteredStories.slice(
    (filteredPage - 1) * STORIES_PER_PAGE,
    filteredPage * STORIES_PER_PAGE
  );

  return (
    <div>
      {/* Poverty-rate search section */}
      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
        Story Search Results
      </h3>

      <div className="mb-4">
        <label className="block text-sm mb-2" style={{ color: 'var(--color-gray)' }}>
          Show stories from countries with poverty rate greater than or equal to:
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            step="0.01"
            min="0"
            value={povertyThreshold}
            onChange={(e) => setPovertyThreshold(e.target.value)}
            placeholder="e.g., 10 (percent)"
            className="border rounded p-2 w-36"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--color-gray-light)',
              color: 'var(--foreground)',
            }}
          />

          <button
            type="button"
            onClick={handleThresholdSearch}
            disabled={thresholdLoading}
            className="px-3 py-2 rounded bg-[#FFA239] text-white font-semibold"
          >
            {thresholdLoading ? 'Searching…' : 'Find stories'}
          </button>

          <button
            type="button"
            onClick={() => {
              setPovertyThreshold('');
              setFilteredStories([]);
              setThresholdError('');
              setFilteredPage(1);
            }}
            className="px-3 py-2 rounded border"
          >
            Clear
          </button>
        </div>

        {thresholdError && <div className="text-sm text-red-600 mt-2">{thresholdError}</div>}
      </div>

      {thresholdLoading && (
        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
          Searching stories for matching countries...
        </p>
      )}
      {filteredStories.length === 0 && !thresholdLoading && !thresholdError && (
        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
          No stories found for matched countries.
        </p>
      )}

      {/* Paginated filtered stories */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            userProfile={story.userEmail ? userProfilesCache[story.userEmail] : null}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setFilteredPage(Math.max(1, filteredPage - 1))}
            disabled={filteredPage === 1}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
            }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setFilteredPage(page)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                filteredPage === page ? 'bg-[#FFA239] text-white' : ''
              }`}
              style={{
                borderColor: 'var(--color-gray-light)',
                color: filteredPage === page ? 'white' : 'var(--foreground)',
                backgroundColor:
                  filteredPage === page
                    ? '#FFA239'
                    : 'var(--background)',
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setFilteredPage(Math.min(totalPages, filteredPage + 1))}
            disabled={filteredPage === totalPages}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--foreground)',
              backgroundColor: 'var(--background)',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
