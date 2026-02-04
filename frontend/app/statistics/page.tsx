/* Beginning of Christella's Code - 1/30/2026 (Map-only left, dropdown+stats right) */
"use client";

import { useEffect, useMemo, useState } from "react";
import StatisticsMapClient from "../../components/StatisticsMapClient";

/* Types relative to Statistics */

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
  country: string; // ISO3
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

/* Geographical IDs to Country Code (kept for map-clicks) */
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

/* Partial fallback names (used only when backend doesn't provide names) */
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

/* Story card component (unchanged) */
function StoryCard({ story }: { story: Story }) {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 220;

  const text = story.storyText || "";
  const needsTruncate = text.length > maxChars;
  const preview = !needsTruncate ? text : text.slice(0, maxChars) + "...";

  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 font-semibold text-gray-900 break-words">
          {story.title?.trim() ? story.title : "Untitled Story"}
        </div>
        {story.createdAt && (
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(story.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

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
    </div>
  );
}

/* Page Code - UI */

export default function StatisticsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [liveResult, setLiveResult] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState("");

  const [statsByCountry, setStatsByCountry] = useState<
    Record<string, CachedStat>
  >({});

  const [mapRows, setMapRows] = useState<MapRow[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // canonical countries list from backend (iso3 + name)
  const [countriesList, setCountriesList] = useState<
    { iso3: string; name?: string }[]
  >([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const selectedGeoId = useMemo(() => {
    if (!selectedCountry) return null;
    return (
      Object.entries(geoIdToCountryCode).find(
        ([_, code]) => code === selectedCountry
      )?.[0] || null
    );
  }, [selectedCountry]);

  const fetchStories = async (iso3: string) => {
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

      setStories(Array.isArray(data.stories) ? data.stories : []);
    } catch (e: any) {
      setStories([]);
      setStoriesError(e?.message || "Server error");
    } finally {
      setStoriesLoading(false);
    }
  };

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

      setMapRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e: any) {
      setMapRows([]);
      setMapError(e?.message || "Server error");
    } finally {
      setMapLoading(false);
    }
  };

  // canonical countries endpoint fetch
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

  // Fallback deriving list from mapRows if backend endpoint is not present / failed
  const deriveCountriesFromMapRows = () => {
    const setIso = new Set<string>();
    mapRows.forEach((r) => {
      if (r?.country) setIso.add(r.country.toUpperCase());
    });
    const derived = Array.from(setIso)
      .sort()
      .map((iso3) => ({ iso3, name: countryNames[iso3] ?? iso3 }));
    setCountriesList(derived);
  };

  useEffect(() => {
    // background prefetch
    fetchMapData();
    // try canonical countries from backend; fallback uses mapRows later
    fetchCountriesFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When mapRows finishes loading, if we don't have a canonical list, derive it
  useEffect(() => {
    if (!countriesList || countriesList.length === 0) {
      deriveCountriesFromMapRows();
    } else {
      const allNamesAreIso = countriesList.every((c) => c.name === c.iso3);
      if (allNamesAreIso) deriveCountriesFromMapRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRows]);

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
        {/* Header code */}
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

            {/* NOTE: quick-pick buttons removed to keep map visually minimal */}
          </div>

          {/* Statistics panel (right) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>

            {/* Dropdown populated from backend (or derived from mapRows) */}
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
                  {countriesList.map((c) => (
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

        {/* Stories section under BOTH map and statistics */}
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
            {stories.map((s) => (
              <StoryCard key={s._id} story={s} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
/* End of Christella's Code - 1/30/2026 */
