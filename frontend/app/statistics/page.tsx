// Edited by Christella - 1/30/2026
//Editted by Marisol 3/4/2026 - Add in Continent filter for when selecting country for easier search. 
"use client";

import { useEffect, useMemo, useState, useCallback } from "react"; // Added by Christella - 1/30/2026
import StatisticsMapClient from "../../components/StatisticsMapClient";
import MapFilters, { RateType } from "../../components/mapfilters"; // Added by Reymes 3/2/26
// Added by Reymes 3/2/26 - import rate data files for filter support
import { NATIONAL_POVERTY_RATES, getNationalPovertyLine } from "../../data/nationalRates";
import { INTERNATIONAL_FALLBACK_RATES } from "../../data/internationalRates"; // Added by Reymes 3/7/26
//Added by Damon 3/6/2026
import PovertyStorySearch from "../../components/PovertyStorySearch";

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

// Start of Added by Marisol 3/4/2026 — continent filter map
const CONTINENT_ISO3: Record<string, string[]> = {
  Africa: [
    "DZA","AGO","BEN","BWA","BFA","BDI","CMR","CAF","TCD","COG","COD","CIV",
    "EGY","ETH","SWZ","GAB","GMB","GHA","GIN","KEN","LSO","LBR","MDG","MWI",
    "MLI","MRT","MAR","MOZ","NAM","NER","NGA","RWA","SEN","SLE","ZAF","SDN",
    "TZA","TGO","TUN","UGA","ZMB","ZWE",
  ],
  Asia: [
    "BGD","IND","JPN","KOR","CHN","IDN","PAK","PHL","VNM","THA","MMR","KHM",
    "LAO","NPL","LKA","KAZ","UZB","AZE","GEO","ARM","IRQ","IRN","SAU","ARE",
    "TUR","ISR","JOR","LBN","YEM","SYR","OMN","KWT","QAT","BHR","AFG","MNG",
  ],
  Europe: [
    "AUT","BEL","FRA","DEU","ITA","NLD","NOR","ESP","SWE","CHE","GBR","POL",
    "PRT","GRC","HUN","CZE","ROU","BGR","HRV","SRB","SVK","SVN","FIN","DNK",
    "IRL","LUX","EST","LVA","LTU","ALB","MKD","BIH","MNE","MDA","BLR","UKR",
    "RUS",
  ],
  "North America": ["CAN","MEX","USA","GTM","BLZ","HND","SLV","NIC","CRI","PAN"],
  "South America": ["BRA","ARG","CHL","COL","PER","VEN","ECU","BOL","PRY","URY","GUY","SUR"],
  Oceania: ["AUS","NZL","PNG","FJI","SLB","VUT","WSM","TON","KIR","FSM"],
};
// End of Added by Marisol 3/4/2026 — continent filter map

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
  const [isSaved, setIsSaved] = useState(false);
  const maxChars = 220;
  // Start of Marisol Code for dark mode support - 2/8/2026
  // Track if dark mode is active
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const savedStories = JSON.parse(localStorage.getItem('savedStories') || '[]');
    const saved = savedStories.some((s: any) => s._id === story._id);
    setIsSaved(saved);
  }, [story._id]);
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

  // - added daniel q. 3/7/26 start
  const handleSaveOffline = () => {
    try {
      const savedStories = JSON.parse(localStorage.getItem('savedStories') || '[]');
      
      const alreadySaved = savedStories.some((s: any) => s._id === story._id);
      
      if (alreadySaved) {
        const updated = savedStories.filter((s: any) => s._id !== story._id);
        localStorage.setItem('savedStories', JSON.stringify(updated));
        setIsSaved(false);
      } else {
        const storyToSave = {
          ...story,
          savedAt: new Date().toISOString(),
          savedUserName: userProfile?.username || 'Anonymous',
          savedUserEmail: userProfile?.email || null
        };
        
        const updated = [...savedStories, storyToSave];
        localStorage.setItem('savedStories', JSON.stringify(updated));
        setIsSaved(true);
      }
      window.dispatchEvent(new Event('savedStoriesUpdated'));
    } catch (error) {
      console.error('Error saving story offline:', error);
    }
  };
    // - added daniel q. 3/7/26 end

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
              // SHOW "PovertyLens User" when displayName = false or user account is deleted - edit by Christella - 03/03/2026
              <div className="text-sm mt-1" style={{ color: 'var(--color-gray)' }}>
                PovertyLens User
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
          {/* save button - daniel q. 3/7/26 start */}
          <button
            onClick={handleSaveOffline}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: isSaved ? '#4CAF50' : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'),
              color: isSaved ? 'white' : (isDark ? 'var(--foreground)' : '#333'),
            }}
            title={isSaved ? "Remove from offline cache" : "Save to read offline"}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill={isSaved ? "white" : "none"} 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          {/* save button - daniel q. 3/7/26 end */}
        </div>
      </div>
    </div>
  );
}

// added daniel .q. 3/7/26 - start
function SavedStoriesSection({ 
  userProfilesCache,
  isDark 
}: { 
  userProfilesCache: Record<string, UserProfile>;
  isDark: boolean;
}) {
  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});

  // Load saved stories on mount and when localStorage changes
  useEffect(() => {
    const loadSaved = () => {
      const saved = JSON.parse(localStorage.getItem('savedStories') || '[]');
      setSavedStories(saved);
    };
    
    loadSaved();
    
    window.addEventListener('storage', loadSaved);
    window.addEventListener('savedStoriesUpdated', loadSaved); 
    return () => { 
      window.removeEventListener('storage', loadSaved);
      window.removeEventListener('savedStoriesUpdated', loadSaved);
    };
  }, []);

  const removeFromSaved = (storyId: string) => {
    const saved = JSON.parse(localStorage.getItem('savedStories') || '[]');
    const updated = saved.filter((s: any) => s._id !== storyId);
    localStorage.setItem('savedStories', JSON.stringify(updated));
    setSavedStories(updated);
  };

  const clearAllSaved = () => {
    if (confirm('Remove all saved stories from offline cache?')) {
      localStorage.removeItem('savedStories');
      setSavedStories([]);
    }
  };

  const toggleExpand = (storyId: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  if (savedStories.length === 0) {
    return (
      <div 
        className="rounded-lg p-8 text-center"
        style={{ 
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
          color: 'var(--color-gray)'
        }}
      >
        <p>No stories saved offline yet.</p>
        <p className="text-sm mt-2">Click the "Save" button on any story to read it offline.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: 'var(--color-gray)' }}>
          {savedStories.length} {savedStories.length === 1 ? 'story' : 'stories'} saved offline
        </p>
        <button
          onClick={clearAllSaved}
          className="text-xs px-3 py-1 rounded border"
          style={{
            borderColor: 'var(--color-gray-light)',
            color: 'var(--color-gray)'
          }}
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedStories.map((story) => {
          const maxChars = 220;
          const text = story.storyText || "";
          const needsTruncate = text.length > maxChars;
          const isExpanded = expandedStates[story._id] || false;
          const preview = !needsTruncate ? text : text.slice(0, maxChars) + "...";
          
          // Create a profile for the story author
          const storyProfile = story.savedUserEmail && userProfilesCache[story.savedUserEmail] 
            ? userProfilesCache[story.savedUserEmail]
            : { 
                username: story.savedUserName || 'Anonymous',
                email: story.savedUserEmail,
                profileImage: null,
                bannerImage: null
              };

          return (
            <div 
              key={story._id}
              className="rounded-xl border shadow-sm p-4 relative"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--color-gray-light)'
              }}
            >
              {/* Offline badge */}
              <div className="absolute top-2 right-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[#FFA239] text-white">
                  Offline
                </span>
              </div>

              {/* Story header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8CE4FF] to-[#FFA239] flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {storyProfile.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {story.title?.trim() ? story.title : "Untitled Story"}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
                    By {storyProfile.username}
                  </div>
                </div>
              </div>

              {/* Story content */}
              <div className="mt-2 text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--foreground)' }}>
                {isExpanded ? text : preview}
              </div>

              {needsTruncate && (
                <button
                  type="button"
                  onClick={() => toggleExpand(story._id)}
                  className="mt-2 text-sm font-semibold text-[#FFA239] hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}

              {/* Footer with save date and remove button */}
              <div 
                className="mt-3 pt-3 border-t text-xs flex justify-between items-center"
                style={{
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-gray)'
                }}
              >
                <span>
                  Saved: {new Date(story.savedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => removeFromSaved(story._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// added daniel .q. 3/7/26 - end

// Added by Christella - 1/30/2026
export default function StatisticsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null); // Added by Marisol 3/4/2026 - continent filter state
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
  // Pagination state - Added by Christella - 03/03/2026
  const [storiesPage, setStoriesPage] = useState(1);
  const [filteredPage, setFilteredPage] = useState(1);
  const STORIES_PER_PAGE = 9;
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
        `${BACKEND_URL}/api/profile/user-images?email=${encodeURIComponent(email)}`
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
      setStoriesPage(1); // Reset to page 1 on new country selection - Added by Christella - 03/03/2026

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
      setFilteredPage(1); // Reset to page 1 on new search - Added by Christella - 03/03/2026
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
      // Added by Reymes 3/7/26 - use INTERNATIONAL_FALLBACK_RATES for high-income countries not in PIP
      Object.entries(NATIONAL_POVERTY_RATES).forEach(([iso]) => {
        if (!byIso.has(iso)) {
          const fallbackHeadcount = INTERNATIONAL_FALLBACK_RATES[iso] ?? null;
          byIso.set(iso, {
            country: iso,
            headcount: fallbackHeadcount,
            year: 2022,
            povline: 2.15,
            source: fallbackHeadcount !== null ? "fallback" : "missing",
            fetchedAt: new Date().toISOString(),
          });
        } else {
          // Country exists in API data but headcount may be null — apply fallback if so
          const existing = byIso.get(iso)!;
          if ((existing.headcount === null || existing.headcount === undefined) && INTERNATIONAL_FALLBACK_RATES[iso] !== undefined) {
            byIso.set(iso, {
              ...existing,
              headcount: INTERNATIONAL_FALLBACK_RATES[iso],
              source: "fallback",
            });
          }
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
        // Modified by marisol morales 3/4 - added continent filter
        const base = derivedCountriesFromMapRows;
        if (!selectedContinent) return base;
        const allowed = new Set(CONTINENT_ISO3[selectedContinent] ?? []);
        return base.filter((c) => allowed.has(c.iso3));
        // End modification
      }
      // Modified by marisol morales 3/4 - added continent filter
      const base = countriesList;
      if (!selectedContinent) return base;
      const allowed = new Set(CONTINENT_ISO3[selectedContinent] ?? []);
      return base.filter((c) => allowed.has(c.iso3));
      // End modification
    }
    // No countries list, use derived
    // Modified by marisol morales 3/4 - added continent filter
    const base = derivedCountriesFromMapRows;
    if (!selectedContinent) return base;
    const allowed = new Set(CONTINENT_ISO3[selectedContinent] ?? []);
    return base.filter((c) => allowed.has(c.iso3));
    // End modification
  }, [countriesList, derivedCountriesFromMapRows, selectedContinent]); // Modified by marisol morales 3/4 - added selectedContinent dependency
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

  // Added by Marisol - 3/3/2026 (needed to fix bug.)
  // Re-fetch stats when rateType changes and a country is already selected
useEffect(() => {
    if (selectedCountry) {
      handleSelectCountry(selectedCountry);
      }
  }, [rateType]);
  // End of addition by Marisol - 3/3/2026


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
            className="rounded-2xl shadow-md p-6 flex flex-col gap-5"
            style={{ backgroundColor: 'var(--background)' }}
          >
            {/* Panel heading */}
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Statistics</h2>

            {/* Start of Added by Marisol 3/4/2026 - Continent filter - moved inside Statistics card by Marisol 3/7/2026 */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-gray)' }}>
                Filter by Continent
              </label>
              <div className="relative">
                <select
                  value={selectedContinent ?? ""}
                  onChange={(e) => {
                    setSelectedContinent(e.target.value || null);
                    setSelectedCountry(null);
                    setLiveResult(null);
                    setStories([]);
                  }}
                  className="w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm transition-all cursor-pointer focus:outline-none"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="">— All continents —</option>
                  {Object.keys(CONTINENT_ISO3).map((continent) => (
                    <option key={continent} value={continent}>{continent}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5L7 9L11 5" stroke="var(--color-gray)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            {/* End of Added by Marisol 3/4/2026 - Continent filter */}

            {/* Country selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-gray)' }}>
                Select Country
              </label>
              {countriesLoading ? (
                <div
                  className="w-full rounded-xl border px-4 py-3 text-sm"
                  style={{ borderColor: 'var(--color-gray-light)', color: 'var(--color-gray)', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                >
                  Loading countries…
                </div>
              ) : countriesError ? (
                <div className="text-sm rounded-xl border px-4 py-3" style={{ borderColor: 'rgba(255,86,86,0.4)', color: 'var(--color-red)', backgroundColor: isDark ? 'rgba(255,86,86,0.07)' : 'rgba(255,86,86,0.05)' }}>
                  Could not load countries: {countriesError}
                </div>
              ) : (
                // Reymes 3/3/26 - simplified dropdown to neutral border/background for improved readability
                <div className="relative">
                  <select
                    value={selectedCountry ?? ""}
                    onChange={(e) => handleSelectCountry(e.target.value || null)}
                    className="w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm transition-all cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--color-gray-light)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <option value="">— Select a country —</option>
                    {countriesToShow.map((c) => (
                      <option key={c.iso3} value={c.iso3}>
                        {c.name ?? c.iso3} ({c.iso3})
                      </option>
                    ))}
                  </select>
                  {/* Chevron icon */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5L7 9L11 5" stroke="var(--color-gray)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-gray)' }}>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Loading statistics…
              </div>
            )}

            {/* Error state */}
            {error && (
              <div
                className="text-sm rounded-xl px-4 py-3 border"
                style={{ color: 'var(--color-red)', borderColor: 'rgba(255,86,86,0.35)', backgroundColor: isDark ? 'rgba(255,86,86,0.07)' : 'rgba(255,86,86,0.05)' }}
              >
                {error}
              </div>
            )}

            {/* Results */}
            {liveResult?.metric && (
              <div className="flex flex-col gap-4">
                {/* Source / date meta */}
                {(liveResult.source || liveResult.fetchedAt) && (
                  <div
                    className="flex flex-wrap gap-x-3 gap-y-1 text-xs px-3 py-2 rounded-lg"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', color: 'var(--color-gray)' }}
                  >
                    {liveResult.source && <span>Source: {liveResult.source}</span>}
                    {liveResult.fetchedAt && (
                      <span>Updated: {new Date(liveResult.fetchedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {/* National poverty line badge - Added by Reymes 3/2/26 */}
                {/* Reymes 3/3/26 - changed to neutral card style (removed yellow tint) to match stat cards */}
                {liveResult.nationalPovertyLine && (
                  <div
                    className="flex flex-col gap-1 px-4 py-3 rounded-lg border"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgb(249,250,251)',
                      borderColor: 'var(--color-gray-light)',
                    }}
                  >
                    <div className="text-xs" style={{ color: 'var(--color-gray)' }}>
                      National Poverty Line
                    </div>
                    <div className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                      {liveResult.nationalPovertyLine.amount.toLocaleString()}{' '}
                      <span className="text-sm font-normal" style={{ color: 'var(--color-gray)' }}>
                        {liveResult.nationalPovertyLine.currency}/yr
                      </span>
                    </div>
                  </div>
                )}

                {/* Stat cards */}
                {/* Reymes 3/3/26 - refactored to single mapped array; removed color-tinted backgrounds in favor of neutral cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[{
                    label: 'Headcount',
                    value: liveResult.metric.headcount,
                  }, {
                    label: 'Pov. Gap',
                    value: liveResult.metric.poverty_gap,
                  }, {
                    label: 'Severity',
                    value: liveResult.metric.poverty_severity,
                  }].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1 p-3 rounded-lg border"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgb(249,250,251)',
                        borderColor: 'var(--color-gray-light)',
                      }}
                    >
                      <div className="text-xs" style={{ color: 'var(--color-gray)' }}>{label}</div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {value !== null && value !== undefined
                          ? `${(value * 100).toFixed(2)}%`
                          : <span style={{ color: 'var(--color-gray)' }}>N/A</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty / prompt state */}
            {!loading && !liveResult?.metric && !error && (
              <div
                className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed"
                style={{ borderColor: 'var(--color-gray-light)', color: 'var(--color-gray)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.4 }}>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-sm text-center">Select a country above to view its poverty statistics.</span>
              </div>
            )}
          </div>
        </div>

        {/* now shows profile picture and names - daniel q. 2/4/26 */}
        <div 
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--background)' }}
        >
        {/* Added by Damon 3/6/2026 */}
          {/* Poverty-rate search section - extracted to separate component */}
          <PovertyStorySearch
            povertyThreshold={povertyThreshold}
            setPovertyThreshold={setPovertyThreshold}
            thresholdLoading={thresholdLoading}
            thresholdError={thresholdError}
            filteredStories={filteredStories}
            filteredPage={filteredPage}
            setFilteredPage={setFilteredPage}
            handleThresholdSearch={handleThresholdSearch}
            userProfilesCache={userProfilesCache}
            setFilteredStories={setFilteredStories}
            setThresholdError={setThresholdError}
            StoryCard={StoryCard}
          />

          {/* Country-specific stories (always shown below search) */}
          <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: 'var(--foreground)' }}>
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

          {/* Paginated country stories - Added by Christella - 03/03/2026 */}
          {(() => {
            const totalPages = Math.ceil(stories.length / STORIES_PER_PAGE);
            const paginated = stories.slice((storiesPage - 1) * STORIES_PER_PAGE, storiesPage * STORIES_PER_PAGE);
            return (
              <>
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
                      onClick={() => setStoriesPage(p => Math.max(1, p - 1))}
                      disabled={storiesPage === 1}
                      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
                      style={{ borderColor: 'var(--color-gray-light)', color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setStoriesPage(page)}
                        className="px-4 py-2 rounded-lg border text-sm font-medium"
                        style={{
                          borderColor: storiesPage === page ? '#FFA239' : 'var(--color-gray-light)',
                          backgroundColor: storiesPage === page ? '#FFA239' : 'var(--background)',
                          color: storiesPage === page ? 'white' : 'var(--foreground)'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setStoriesPage(p => Math.min(totalPages, p + 1))}
                      disabled={storiesPage === totalPages}
                      className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40"
                      style={{ borderColor: 'var(--color-gray-light)', color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
        {/* added daniel q. 3/7/26 start */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            Your Saved Stories (Offline)
          </h3>
          
          <SavedStoriesSection 
            userProfilesCache={userProfilesCache}
            isDark={isDark}
          />
        </div>
        {/* added daniel q. 3/7/26 end */}
      </main>
    </div>
  );
}