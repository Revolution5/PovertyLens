// Edited by Christella - 1/30/2026
"use client";

import { useEffect, useMemo, useState, useCallback } from "react"; // Added by Christella - 1/30/2026
import StatisticsMapClient from "../../components/StatisticsMapClient";
import MapFilters, { RateType } from "../../components/mapfilters"; // Added by Reymes 3/2/26
// Added by Reymes 3/2/26 - import rate data files for filter support
import { NATIONAL_POVERTY_RATES, getNationalPovertyLine } from "../../data/nationalRates";

// Added by Christella Taguicana - 02/03/2026
/* Typees relative to Statistics */
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
// End of addition by Christella Taguicana - 02/03/2026

type UserProfile = {
  email: string;
  username: string;
  profileImage?: string | null;
  bannerImage?: string | null;
};

// Added by Christella - 1/30/2026
type LiveResponse = {
  success: boolean;
  source?: string;
  country?: string;
  year?: number | null;
  povline?: number;
  fetchedAt?: string;
  // Added by Reymes 3/2/26 - national poverty line for selected countries
  nationalPovertyLine?: { amount: number; currency: string } | null;
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
// End of addition by Christella - 1/30/2026

// Added by Christella - 1/30/2026
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/* Geographical IDs to Country Code */
// Updated 2/20/26 - Added more countries Reymes
// Organized by continent - 2/20/26 Reymes
const geoIdToCountryCode: Record<string, string> = {
  // AFRICA
  "12": "DZA",
  "24": "AGO",
  "204": "BEN",
  "72": "BWA",
  "854": "BFA",
  "108": "BDI",
  "120": "CMR",
  "140": "CAF",
  "148": "TCD",
  "178": "COG",
  "180": "COD",
  "384": "CIV",
  "818": "EGY",
  "231": "ETH",
  "748": "SWZ",
  "266": "GAB",
  "270": "GMB",
  "288": "GHA",
  "324": "GIN",
  "404": "KEN",
  "426": "LSO",
  "430": "LBR",
  "450": "MDG",
  "454": "MWI",
  "466": "MLI",
  "478": "MRT",
  "504": "MAR",
  "508": "MOZ",
  "516": "NAM",
  "562": "NER",
  "566": "NGA",
  "646": "RWA",
  "686": "SEN",
  "694": "SLE",
  "710": "ZAF",
  "729": "SDN",
  "834": "TZA",
  "768": "TGO",
  "788": "TUN",
  "800": "UGA",
  "894": "ZMB",
  "716": "ZWE",
  
  // ASIA
  "50": "BGD",
  "356": "IND",
  "392": "JPN",
  "410": "KOR",
  
  // EUROPE
  "40": "AUT",
  "56": "BEL",
  "250": "FRA",
  "276": "DEU",
  "380": "ITA",
  "528": "NLD",
  "578": "NOR",
  "724": "ESP",
  "752": "SWE",
  "756": "CHE",
  "826": "GBR",
  
  // NORTH AMERICA
  "124": "CAN",
  "484": "MEX",
  "840": "USA",
  
  // SOUTH AMERICA
  "76": "BRA",
  
  // OCEANIA
  "36": "AUS",
};
// End of addition by Christella - 1/30/2026

/* Country names */
// Updated 2/20/26 - Added more developed countries
// Organized by continent - 2/20/26
const countryNames: Record<string, string> = {
  // AFRICA
  DZA: "Algeria",
  AGO: "Angola",
  BEN: "Benin",
  BWA: "Botswana",
  BFA: "Burkina Faso",
  BDI: "Burundi",
  CMR: "Cameroon",
  CAF: "Central African Republic",
  TCD: "Chad",
  COG: "Congo",
  COD: "Democratic Republic of the Congo",
  CIV: "Côte d'Ivoire",
  EGY: "Egypt",
  ETH: "Ethiopia",
  SWZ: "Eswatini",
  GAB: "Gabon",
  GMB: "Gambia",
  GHA: "Ghana",
  GIN: "Guinea",
  KEN: "Kenya",
  LSO: "Lesotho",
  LBR: "Liberia",
  MDG: "Madagascar",
  MWI: "Malawi",
  MLI: "Mali",
  MRT: "Mauritania",
  MAR: "Morocco",
  MOZ: "Mozambique",
  NAM: "Namibia",
  NER: "Niger",
  NGA: "Nigeria",
  RWA: "Rwanda",
  SEN: "Senegal",
  SLE: "Sierra Leone",
  ZAF: "South Africa",
  SDN: "Sudan",
  TZA: "Tanzania",
  TGO: "Togo",
  TUN: "Tunisia",
  UGA: "Uganda",
  ZMB: "Zambia",
  ZWE: "Zimbabwe",
  
  // ASIA
  BGD: "Bangladesh",
  IND: "India",
  JPN: "Japan",
  KOR: "South Korea",
  
  // EUROPE
  AUT: "Austria",
  BEL: "Belgium",
  FRA: "France",
  DEU: "Germany",
  ITA: "Italy",
  NLD: "Netherlands",
  NOR: "Norway",
  ESP: "Spain",
  SWE: "Sweden",
  CHE: "Switzerland",
  GBR: "United Kingdom",
  
  // NORTH AMERICA
  CAN: "Canada",
  MEX: "Mexico",
  USA: "United States",
  
  // SOUTH AMERICA
  BRA: "Brazil",
  
  // OCEANIA
  AUS: "Australia",
};

// Added by Reymes 3/2/26 - national poverty rates imported from data/nationalRates.ts

// Added by Christella - 1/30/2026
function StoryCard({ 
  // Added by Daniel
  story, 
  userProfile 
}: { 
  story: Story; 
  userProfile?: UserProfile | null;
}) // End of addition by Daniel
  {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 220;
  // Start of Marisol Code for dark mode support - 2/8/2026
  // Track if dark mode is active
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    setIsDark(document.documentElement.classList.contains('dark'));

    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    // Start observing class changes on html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);
// End of Marisol Code for dark mode support - 2/8/2026
  const text = story.storyText || "";
  const needsTruncate = text.length > maxChars;
  const preview = !needsTruncate ? text : text.slice(0, maxChars) + "...";
  const showName = story.displayName && userProfile?.username; // Added by Daniel
  const showPhoto = story.displayPhoto && userProfile?.profileImage; // Added by Daniel

  return (
    <div 
      className="rounded-xl border shadow-sm p-4"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--color-gray-light)'
      }}
    >
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
            <div className="font-semibold break-all" style={{ color: 'var(--foreground)' }}>
              {story.title?.trim() ? story.title : "Untitled Story"}
            </div>
            
            {/* SHOW AUTHOR NAME WHEN displayName = true */}
            {showName ? (
              <div className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
                By {userProfile!.username}
              </div>
            ) : (
              // SHOW "ANONYMOUS" WHEN displayName = false
              <div className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
                Anonymous
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        {story.createdAt && (
          <div className="text-xs whitespace-nowrap" style={{ color: 'var(--color-gray)' }}>
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Story Content (Unchanged) */}
      <div className="mt-2 text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--foreground)' }}>
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

      <div 
        className="mt-3 pt-3 border-t text-xs"
        style={{
          borderColor: 'var(--color-gray-light)',
          color: 'var(--color-gray)'
        }}
      >
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

// Added by Christella - 1/30/2026
export default function StatisticsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState("");
  //Added by Damon 2/18/2026
  const [povertyThreshold, setPovertyThreshold] = useState<string>("");
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholdError, setThresholdError] = useState("");
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  //
  const [statsByCountry, setStatsByCountry] = useState<Record<string, CachedStat>>({});
  const [mapRows, setMapRows] = useState<MapRow[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [countriesList, setCountriesList] = useState<{ iso3: string; name?: string }[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  // End of addition by Christella - 1/30/2026
  
  // Added by Reymes 3/2/26 - toggle between national and international poverty rates on map
  const [rateType, setRateType] = useState<RateType>("national");
  
  /* user profile cache - daniel q. 2/4 */
  const [userProfilesCache, setUserProfilesCache] = useState<Record<string, UserProfile>>({});

  const [isDark, setIsDark] = useState(false);
// Marisol code to detect dark mode changes - 2/8/2026
  useEffect(() => {
    // Set initial dark mode state
    setIsDark(document.documentElement.classList.contains('dark'));

    // Create observer to watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    // Observe class attribute changes on html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Disconnect observer when component unmounts
    return () => observer.disconnect();
  }, []);
// End of Marisol code to detect dark mode changes - 2/8/2026

  // Added by Christella - 1/30/2026
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

  // End of addition by Christella - 1/30/2026, edited by Daniel
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
  
  //Added by Damon 2/18/2026
  //Fetch stories for multiple ISO3 country codes and merge results
  const fetchStoriesForCountries = useCallback(async (iso3List: string[]) => {
    if (!iso3List || iso3List.length === 0) {
      setFilteredStories([]);
      return [] as Story[];
    }

    try {
      const promises = iso3List.map(async (iso) => {
        const res = await fetch(`${BACKEND_URL}/api/stories?country=${encodeURIComponent(iso)}`);
        const data = await res.json();
        if (!res.ok || !data.success) return [] as Story[];
        return Array.isArray(data.stories) ? data.stories : [];
      });

      const results = await Promise.all(promises);
      const flat = results.flat();

      // dedupe by _id
      const byId = new Map<string, Story>();
      flat.forEach((s) => {
        if (s && s._id) byId.set(s._id, s);
      });

      const merged = Array.from(byId.values());
      setFilteredStories(merged);
      await fetchProfilesForStories(merged);
      return merged;
    } catch (err) {
      setFilteredStories([]);
      return [] as Story[];
    }
  }, [fetchProfilesForStories]);

  const handleThresholdSearch = async () => {
    setThresholdError("");
    setThresholdLoading(true);
    setFilteredStories([]);

    const parsed = parseFloat(povertyThreshold);
    if (Number.isNaN(parsed)) {
      setThresholdError("Enter a valid number for the poverty rate.");
      setThresholdLoading(false);
      return;
    }

    // find countries in mapRows with headcount >= parsed
    // Updated by Reymes 3/2/26 - use national poverty rates for developed countries when available

    // The API may return headcount as a decimal fraction (e.g. 0.10 for 10%),
    // so normalize to percentage when the value is <= 1. For some developed
    // countries we prefer the NATIONAL_POVERTY_RATES override.
    const matches = mapRows
      .filter((r) => !!r.country)
      .map((r) => {
        const iso = r.country?.toUpperCase();
        const raw = (r.headcount as number) ?? NaN;
        let rate = Number.NaN;
        // Added by Reymes 3/2/26 - apply national rates first for developed countries
        if (iso && NATIONAL_POVERTY_RATES[iso]) {
          rate = NATIONAL_POVERTY_RATES[iso]?.rate ?? null;
        } else if (!Number.isNaN(raw)) {
          rate = raw <= 1 ? raw * 100 : raw;
        }
        return { iso, rate };
      })
      .filter((x) => x.iso && typeof x.rate === "number" && !Number.isNaN(x.rate) && x.rate >= parsed)
      .map((x) => x.iso as string);

    if (matches.length === 0) {
      setThresholdError("No countries found at or above that poverty rate.");
      setThresholdLoading(false);
      setFilteredStories([]);
      return;
    }

    try {
      await fetchStoriesForCountries(matches);
    } catch (err: any) {
      setThresholdError(err?.message || "Failed to fetch stories for matched countries.");
    } finally {
      setThresholdLoading(false);
    }
  };

  // Added by Christella Taguicana - 02/03/2026
  // Loads dataset used to decide which countries to show markers for
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

      // Added by Reymes 3/2/26 - keep mapRows pure API-only, apply filters at render time
      const incomingRows: MapRow[] = Array.isArray(data.rows) ? data.rows : [];
      const byIso = new Map<string, MapRow>();

      incomingRows.forEach((row) => {
        if (!row?.country) return;
        const iso = row.country.toUpperCase();
        byIso.set(iso, row);
      });

      // Added by Reymes 3/2/26 - inject placeholder rows for countries missing API data
      // (national rates will be applied only when filter is set to "national")
      Object.entries(NATIONAL_POVERTY_RATES).forEach(([iso]) => {
        if (!byIso.has(iso)) {
          byIso.set(iso, {
            country: iso,
            headcount: null,
            year: 2022,
            povline: 2.15,
            source: "missing",
            fetchedAt: new Date().toISOString(),
          });
        }
      });

      setMapRows(Array.from(byIso.values()));
    } catch (e: any) {
      setMapRows([]);
      setMapError(e?.message || "Server error");
    } finally {
      setMapLoading(false);
    }
  };

  // Countries endpoint fetch
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

  // Fallback deriving list from mapRows if backend endpoint is not present/failed
  const derivedCountriesFromMapRows = useMemo(() => {
    const setIso = new Set<string>();
    mapRows.forEach((r) => {
      if (r?.country) setIso.add(r.country.toUpperCase());
    });

    return Array.from(setIso)
      .sort()
      .map((iso3) => ({ iso3, name: countryNames[iso3] ?? iso3 }));
  }, [mapRows]);
  // End of addition by Christella - 01/30/2026

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
      
      // Edit by Christella - 01/30/2026
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

    // Added by Reymes 3/2/26 - strict national-only behavior for national filter
    if (rateType === "national") {
      const fallbackData = NATIONAL_POVERTY_RATES[iso3.toUpperCase()];
      if (fallbackData) {
        const povLineData = getNationalPovertyLine(iso3);
        setLiveResult({
          success: true,
          source: `National poverty line (${fallbackData.description})`,
          country: iso3,
          year: fallbackData.year,
          povline: fallbackData.povLine,
          nationalPovertyLine: povLineData,
          metric: {
            headcount: fallbackData.rate / 100,
            poverty_gap: null,
            poverty_severity: null,
          },
        });
      } else {
        setError("No national poverty-line data is available for this country yet.");
      }
      return;
    }

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
      // End of addition by Christella - 01/30/2026
    } finally {
      setLoading(false);
    }
  };

  // Added by Christella - 1/30/2026
  const handleCountryClick = async (geoId: string) => {
    const iso3 = geoIdToCountryCode[geoId];
    if (!iso3) return;
    await handleSelectCountry(iso3);
  };
  // End of addition by Christella - 1/30/2026

  return (
    <div 
      className="min-h-screen"
      style={{
        background: isDark 
          ? 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.05), rgba(254, 238, 145, 0.05), rgba(255, 162, 57, 0.05))'
          : 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.1), rgba(254, 238, 145, 0.1), rgba(255, 162, 57, 0.1))'
      }}
    >
      <main style={{padding: '40px 80px 80px',}}>
        {/* ---- Header ---- Edited by Christella Taguicana - 02/17/2026 */}
        <header style={{ marginBottom: 32, paddingLeft: 24 }}>
          <h1
            className="text-4xl sm:text-5xl font-bold"
            style={{
              margin: '0 0 16px 0',
              color: 'var(--foreground)',
            }}
          >
            Global Poverty Statistics
          </h1>

          {/* Decorative divider using brand gradient */}
          <div
            style={{
              height: 4,
              width: 80,
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-cyan-yellow)',
              margin: '0 0 24px 0',
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.7,
              color: 'var(--color-gray-dark)',
            }}
          >
            Select a country from the dropdown to explore poverty statistics and stories.
          </p>
        </header>
        {/* ---- End of edit by Christella Taguicana - 02/17/2026 */}

        {/* Grid for content display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Map panel (left) - edited so that map doesn't overlap the navigation bar*/}
          <div 
            className="lg:col-span-2 rounded-lg shadow-md p-6 relative z-0"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Map</h2>
            {/* Added by Reymes 3/2/26 - rate type toggle */}
            <div className="mb-4">
              <MapFilters value={rateType} onChange={setRateType} />
            </div>
            <div className="mb-4 relative z-0">
              <StatisticsMapClient
                selectedGeoId={selectedGeoId}
                onCountryClick={handleCountryClick}
                mapRows={mapRows}
                showMarkers={false}
                rateType={rateType}
              />
              <div className="mt-2 text-sm" style={{ color: 'var(--color-gray)' }}>
                The map shows a baselayer only. Pick a country from the panel to the right.
              </div>
              {mapLoading && (
                <div className="mt-2 text-sm" style={{ color: 'var(--color-gray)' }}>
                  Loading map data in background...
                </div>
              )}
              {mapError && <div className="mt-2 text-sm text-red-600">{mapError}</div>}
            </div>
          </div>

          {/* Added by Christella - 01/30/2026 */}
          {/* Statistics panel (right) */}
          <div 
            className="rounded-lg shadow-md p-6"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Statistics</h2>
            <div className="mb-3">
              {countriesLoading ? (
                <div className="text-sm" style={{ color: 'var(--color-gray)' }}>Loading countries…</div>
              ) : countriesError ? (
                <div className="text-sm text-red-600">Could not load countries: {countriesError}</div>
              ) : (
                <select
                  value={selectedCountry ?? ""}
                  onChange={(e) => handleSelectCountry(e.target.value || null)}
                  className="w-full border rounded p-2 mb-4"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)'
                  }}
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
              <div className="text-sm" style={{ color: 'var(--color-gray)' }}>Loading statistics...</div>
            )}

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {liveResult?.metric && (
              <>
                <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
                  {liveResult.source ? `Source: ${liveResult.source}` : ""}
                  {liveResult.fetchedAt
                    ? ` • Updated: ${new Date(liveResult.fetchedAt).toLocaleString()}`
                    : ""}
                </div>

                {/* Added by Reymes 3/2/26 - show national poverty line when available */}
                {liveResult.nationalPovertyLine && (
                  <div 
                    className="p-3 rounded mt-2 mb-3"
                    style={{ backgroundColor: isDark ? 'rgba(135, 206, 235, 0.1)' : 'rgb(230, 244, 255)' }}
                  >
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>National Poverty Line</div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {liveResult.nationalPovertyLine.amount.toLocaleString()} {liveResult.nationalPovertyLine.currency}/year
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div 
                    className="p-3 rounded"
                    style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgb(249, 250, 251)' }} // Changed by Marisol for dark mode support - 2/8/2026
                  >
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>Headcount</div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {liveResult.metric.headcount !== null && liveResult.metric.headcount !== undefined
                        ? `${(liveResult.metric.headcount * 100).toFixed(2)}%` //converted to percentage Reymes
                        : "N/A"}
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded"
                    style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgb(249, 250, 251)' }} // Changed by Marisol for dark mode support - 2/8/2026
                  >
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>Gap</div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {liveResult.metric.poverty_gap !== null && liveResult.metric.poverty_gap !== undefined
                        ? `${(liveResult.metric.poverty_gap * 100).toFixed(2)}%` //converted to percentage Reymes
                        : "N/A"}
                    </div>
                  </div>
                  <div 
                    className="p-3 rounded"
                    style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgb(249, 250, 251)' }} // Changed by Marisol for dark mode support - 2/8/2026
                  >
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>Severity</div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {liveResult.metric.poverty_severity !== null && liveResult.metric.poverty_severity !== undefined
                        ? `${(liveResult.metric.poverty_severity * 100).toFixed(2)}%`  //converted to percentage Reymes
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!loading && selectedCountry && !liveResult?.metric && !error && (
              <div className="text-sm" style={{ color: 'var(--color-gray)' }}>Select a country to load statistics.</div>
            )}
          </div>
        </div>

        {/* now shows profile picture and names - daniel q. 2/4 */}
        <div 
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--background)' }}
        >
          {/* Country-specific stories (always shown at top) */}
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            {selectedCountry ? `Stories from ${countryNames[selectedCountry] ?? selectedCountry}` : "Stories"}
          </h3>

{/* Added/modified by Damon 2/20/2026 */}
          {!selectedCountry && (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
              Select a country from the dropdown to view stories from that country.
            </p>
          )}

          {selectedCountry && storiesLoading && (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>Loading stories...</p>
          )}

          {selectedCountry && storiesError && (
            <p className="text-sm text-red-600">{storiesError}</p>
          )}

          {selectedCountry && !storiesLoading && !storiesError && stories.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No stories for this country yet.</p>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                userProfile={story.userEmail ? userProfilesCache[story.userEmail] : null}
              />
            ))}
          </div>

          {/* Poverty-rate search section (always shown below) */}
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
                  color: 'var(--foreground)'
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
                onClick={() => { setPovertyThreshold(''); setFilteredStories([]); setThresholdError(''); }}
                className="px-3 py-2 rounded border"
              >
                Clear
              </button>
            </div>

            {thresholdError && <div className="text-sm text-red-600 mt-2">{thresholdError}</div>}
          </div>

{/* Added/modified by Damon 2/20/2026 */}
          {thresholdLoading && <p className="text-sm" style={{ color: 'var(--color-gray)' }}>Searching stories for matching countries...</p>}
          {filteredStories.length === 0 && !thresholdLoading && !thresholdError && (
            <p className="text-sm" style={{ color: 'var(--color-gray)' }}>No stories found for matched countries.</p>
          )}

{/* Added/modified by Damon 2/20/2026 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                userProfile={story.userEmail ? userProfilesCache[story.userEmail] : null}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}