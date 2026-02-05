"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import StatisticsMapClient from "../../components/StatisticsMapClient";

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

type LiveResponse = {
  success: boolean;
  source?: string;
  country?: string;
  year?: number | null;
  povline?: number;
  fetchedAt?: string;
  metric?: {
    headcount?: number | null;
    poverty_gap?: number | null;
    poverty_severity?: number | null;
  } | null;
  data?: any;
  message?: string;
};

type CachedStat = {
  country: string;
  year: number | null;
  povline: number;
  metric: {
    headcount: number | null;
    poverty_gap: number | null;
    poverty_severity: number | null;
  } | null;
  fetchedAt?: string;
  source?: string;
};

type MapRow = {
  country: string;
  headcount: number | null;
  poverty_gap?: number | null;
  poverty_severity?: number | null;
  year: number;
  povline: number;
  fetchedAt?: string;
  source?: string;
  error?: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/* Geographical IDs to Country Code */
const geoIdToCountryCode: Record<string, string> = {
  "50": "BGD",
  "76": "BRA",
  "231": "ETH",
  "356": "IND",
  "404": "KEN",
  "484": "MEX",
  "566": "NGA",
  "840": "USA",
};

/* Country names */
const countryNames: Record<string, string> = {
  BGD: "Bangladesh",
  BRA: "Brazil",
  ETH: "Ethiopia",
  IND: "India",
  KEN: "Kenya",
  MEX: "Mexico",
  NGA: "Nigeria",
  USA: "United States",
};

function StoryCard({ 
  story, 
  userProfile 
}: { 
  story: Story; 
  userProfile?: UserProfile | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 220;

  const text = story.storyText || "";
  const needsTruncate = text.length > maxChars;
  const preview = !needsTruncate ? text : text.slice(0, maxChars) + "...";
  const showName = story.displayName && userProfile?.username;
  const showPhoto = story.displayPhoto && userProfile?.profileImage;

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      {/* redesigned to show user info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* conditional display */}
          {showPhoto ? (
            // SHOW ACTUAL PROFILE PHOTO WHEN displayPhoto = true
            <div className="flex-shrink-0">
              <img
                src={userProfile!.profileImage!.startsWith('http') 
                  ? userProfile!.profileImage!
                  : `${BACKEND_URL}${userProfile!.profileImage}`}
                alt={userProfile!.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* FALLBACK AVATAR - Shown if image fails to load */}
              <div className="hidden w-10 h-10 rounded-full bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userProfile!.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            // PLACEHOLDER AVATAR - Shown when displayPhoto = false
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
          )}

          {/* story title and author section */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="font-semibold text-gray-900 break-all">
              {story.title?.trim() ? story.title : "Untitled Story"}
            </div>
            
            {/* SHOW AUTHOR NAME WHEN displayName = true */}
            {showName ? (
              <div className="text-sm text-gray-600 mt-1">
                By {userProfile!.username}
              </div>
            ) : (
              // SHOW "ANONYMOUS" WHEN displayName = false
              <div className="text-sm text-gray-400 mt-1">
                Anonymous
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        {story.createdAt && (
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Story Content (Unchanged) */}
      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
        {expanded ? text : preview}
      </div>

      {needsTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-[#FFA239] hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Name: {story.displayName ? "Shown" : "Hidden"}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Photo: {story.displayPhoto ? "Shown" : "Hidden"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState("");
  const [statsByCountry, setStatsByCountry] = useState<Record<string, CachedStat>>({});
  const [mapRows, setMapRows] = useState<MapRow[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [countriesList, setCountriesList] = useState<{ iso3: string; name?: string }[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  
  /* user profile cache - daniel q. 2/4 */
  const [userProfilesCache, setUserProfilesCache] = useState<Record<string, UserProfile>>({});

  const selectedGeoId = useMemo(() => {
    if (!selectedCountry) return null;
    return (
      Object.entries(geoIdToCountryCode).find(
        ([_, code]) => code === selectedCountry
      )?.[0] || null
    );
  }, [selectedCountry]);

  /* fetch user profile - daniel q. 2/4 */
  const fetchUserProfile = useCallback(async (email: string): Promise<UserProfile | null> => {
    if (!email) return null;
    
    if (userProfilesCache[email]) {
      return userProfilesCache[email];
    }

    try {
      const profileRes = await fetch(
        `${BACKEND_URL}/api/user-images?email=${encodeURIComponent(email)}`
      );
      const profileData = await profileRes.json();

      let profileImage = null;
      let bannerImage = null;
      
      if (profileData.success) {
        profileImage = profileData.profileImage;
        bannerImage = profileData.bannerImage;
      }

      const userRes = await fetch(`${BACKEND_URL}/api/user-by-email?email=${encodeURIComponent(email)}`);
      let username = email.split('@')[0];
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          username = userData.user.username || username;
        }
      }

      const profile: UserProfile = {
        email,
        username,
        profileImage,
        bannerImage
      };

      setUserProfilesCache(prev => ({ ...prev, [email]: profile }));
      return profile;

    } catch (error) {
      console.error(`Error fetching profile for ${email}:`, error);
      return null;
    }
  }, [userProfilesCache]);

  /* fetch profiles for stories - daniel q. 2/4 */
  const fetchProfilesForStories = useCallback(async (storiesList: Story[]) => {
    const emails = storiesList
      .map(story => story.userEmail)
      .filter((email): email is string => !!email && !userProfilesCache[email]);

    if (emails.length === 0) return;

    // FETCH ALL PROFILES IN PARALLEL
    const profilePromises = emails.map(email => fetchUserProfile(email));
    await Promise.all(profilePromises);
  }, [fetchUserProfile, userProfilesCache]);

  const fetchStories = useCallback(async (iso3: string) => {
    setStoriesLoading(true);
    setStoriesError("");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/stories?country=${encodeURIComponent(iso3)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load stories");
      }

      const storiesList = Array.isArray(data.stories) ? data.stories : [];
      setStories(storiesList);

      await fetchProfilesForStories(storiesList);

    } catch (e: any) {
      setStories([]);
      setStoriesError(e?.message || "Server error");
    } finally {
      setStoriesLoading(false);
    }
  }, [fetchProfilesForStories]);

  const fetchMapData = async () => {
    setMapLoading(true);
    setMapError(null);

    try {
      const y = 2022;
      const p = 2.15;

      const res = await fetch(
        `${BACKEND_URL}/api/poverty/pip-map?year=${y}&povline=${p}&maxAgeDays=30`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load map data");
      }

      setMapRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e: any) {
      setMapRows([]);
      setMapError(e?.message || "Server error");
    } finally {
      setMapLoading(false);
    }
  };

  const fetchCountriesFromBackend = async () => {
    setCountriesLoading(true);
    setCountriesError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/poverty/countries`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid response shape");

      const normalized = Array.from(
        new Map(
          data
            .filter(Boolean)
            .map((d: any) => {
              const iso = (d.iso3 || d.iso || d.code || "")
                .toString()
                .trim()
                .toUpperCase();
              const name = (d.name || d.title || d.label || iso).toString();
              return [iso, { iso3: iso, name }];
            })
        ).values()
      );

      normalized.sort((a, b) => a.name.localeCompare(b.name));
      setCountriesList(normalized);
      return;
    } catch (err: any) {
      console.warn("Could not fetch canonical countries list:", err?.message || err);
      setCountriesList([]);
      setCountriesError(err?.message || "Failed to fetch countries");
    } finally {
      setCountriesLoading(false);
    }
  };

  const derivedCountriesFromMapRows = useMemo(() => {
    const setIso = new Set<string>();
    mapRows.forEach((r) => {
      if (r?.country) setIso.add(r.country.toUpperCase());
    });

    return Array.from(setIso)
      .sort()
      .map((iso3) => ({ iso3, name: countryNames[iso3] ?? iso3 }));
  }, [mapRows]);

  const countriesToShow = useMemo(() => {
    // If we have a proper countries list with names, use it
    if (countriesList && countriesList.length > 0) {
      const allNamesAreIso = countriesList.every((c) => c.name === c.iso3);
      // If all names are just ISO codes, fall back to derived list
      if (allNamesAreIso) {
        return derivedCountriesFromMapRows;
      }
      return countriesList;
    }
    // No countries list, use derived
    return derivedCountriesFromMapRows;
  }, [countriesList, derivedCountriesFromMapRows]);

  useEffect(() => {
    fetchMapData();
    fetchCountriesFromBackend();
  }, []);

  async function fetchCountryStat(iso3: string): Promise<CachedStat | null> {
    try {
      const povline = 2.15;
      const maxAgeDays = 30;

      const url = `${BACKEND_URL}/api/poverty/summary?country=${encodeURIComponent(
        iso3
      )}&povline=${povline}&maxAgeDays=${maxAgeDays}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.warn("fetchCountryStat failed:", data);
        return null;
      }

      const stat: CachedStat = {
        country: iso3,
        year: data.year ?? null,
        povline: data.povline ?? povline,
        metric: data.metric ?? null,
        fetchedAt: data.fetchedAt,
        source: data.source,
      };

      setStatsByCountry((prev) => ({ ...prev, [iso3]: stat }));
      return stat;
    } catch (err) {
      console.error("fetchCountryStat error:", err);
      return null;
    }
  }

  const handleSelectCountry = async (iso3: string | null) => {
    if (!iso3) {
      setSelectedCountry(null);
      setLiveResult(null);
      setStories([]);
      return;
    }

    setSelectedCountry(iso3);
    setError("");
    setLiveResult(null);

    setStories([]);
    fetchStories(iso3);

    setLoading(true);
    try {
      const cached = statsByCountry[iso3];
      if (cached && cached.metric) {
        setLiveResult({
          success: true,
          source: cached.source || "Cached dataset",
          country: iso3,
          year: cached.year,
          povline: cached.povline,
          fetchedAt: cached.fetchedAt,
          metric: cached.metric,
        });
        return;
      }

      const stat = await fetchCountryStat(iso3);
      if (!stat || !stat.metric) {
        setError("No data is available for this country right now.");
        return;
      }

      setLiveResult({
        success: true,
        source: stat.source || "Fetched",
        country: iso3,
        year: stat.year,
        povline: stat.povline,
        fetchedAt: stat.fetchedAt,
        metric: stat.metric,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCountryClick = async (geoId: string) => {
    const iso3 = geoIdToCountryCode[geoId];
    if (!iso3) return;
    await handleSelectCountry(iso3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF]/10 via-[#FEEE91]/10 to-[#FFA239]/10">
      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
              Global Poverty Statistics
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Select a country from the dropdown to explore poverty statistics and stories
          </p>
        </div>

        {/* Grid for content display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Map panel (left) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Map</h2>
            <div className="mb-4">
              <StatisticsMapClient
                selectedGeoId={selectedGeoId}
                onCountryClick={handleCountryClick}
                mapRows={mapRows}
                showMarkers={false}
              />
              <div className="mt-2 text-sm text-gray-500">
                The map shows a baselayer only. Pick a country from the panel to the right.
              </div>
              {mapLoading && (
                <div className="mt-2 text-sm text-gray-500">
                  Loading map data in background...
                </div>
              )}
              {mapError && <div className="mt-2 text-sm text-red-600">{mapError}</div>}
            </div>
          </div>

          {/* Statistics panel (right) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="mb-3">
              {countriesLoading ? (
                <div className="text-sm text-gray-500">Loading countries…</div>
              ) : countriesError ? (
                <div className="text-sm text-red-600">Could not load countries: {countriesError}</div>
              ) : (
                <select
                  value={selectedCountry ?? ""}
                  onChange={(e) => handleSelectCountry(e.target.value || null)}
                  className="w-full border rounded p-2 mb-4"
                >
                  <option value="">— Select a country —</option>
                  {countriesToShow.map((c) => (
                    <option key={c.iso3} value={c.iso3}>
                      {c.name ?? c.iso3} ({c.iso3})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading && (
              <div className="text-sm text-gray-500">Loading statistics...</div>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {liveResult?.metric && (
              <>
                <div className="text-xs text-gray-500">
                  {liveResult.source ? `Source: ${liveResult.source}` : ""}
                  {liveResult.fetchedAt
                    ? ` • Updated: ${new Date(liveResult.fetchedAt).toLocaleString()}`
                    : ""}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Headcount</div>
                    <div className="font-semibold">
                      {liveResult.metric.headcount ?? "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Gap</div>
                    <div className="font-semibold">
                      {liveResult.metric.poverty_gap ?? "N/A"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Severity</div>
                    <div className="font-semibold">
                      {liveResult.metric.poverty_severity ?? "N/A"}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!loading && selectedCountry && !liveResult?.metric && !error && (
              <div className="text-sm text-gray-500">Select a country to load statistics.</div>
            )}
          </div>
        </div>

        {/* now shows profile picture and names - daniel q. 2/4 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">
            Stories {selectedCountry ? `from ${countryNames[selectedCountry] ?? selectedCountry}` : ""}
          </h3>

          {!selectedCountry && (
            <p className="text-sm text-gray-500">
              Select a country from the dropdown to view stories from that country.
            </p>
          )}

          {selectedCountry && storiesLoading && (
            <p className="text-sm text-gray-500">Loading stories...</p>
          )}

          {selectedCountry && storiesError && (
            <p className="text-sm text-red-600">{storiesError}</p>
          )}

          {selectedCountry &&
            !storiesLoading &&
            !storiesError &&
            stories.length === 0 && (
              <p className="text-sm text-gray-500">No stories for this country yet.</p>
            )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                /* passes user profile data to storycard - daniel q. 2/4 */
                userProfile={story.userEmail ? userProfilesCache[story.userEmail] : null}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}