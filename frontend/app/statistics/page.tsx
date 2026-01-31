"use client";

import { useMemo, useState } from "react";

/* ================= TYPES ================= */

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

/* ================= CONSTANTS ================= */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

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

/* ================= PAGE ================= */

export default function StatisticsPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [line, setLine] = useState("");

  const [liveResult, setLiveResult] = useState<LiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedGeoId = useMemo(() => {
    if (!selectedCountry) return null;
    return (
      Object.entries(geoIdToCountryCode).find(
        ([_, code]) => code === selectedCountry
      )?.[0] || null
    );
  }, [selectedCountry]);

  const handleCountryClick = (geoId: string) => {
    const iso3 = geoIdToCountryCode[geoId];
    if (!iso3) return;
    setSelectedCountry(iso3);
    setLiveResult(null);
    setError("");
  };

  const handleFetch = async () => {
    if (!selectedCountry || !year || !line) {
      setError("Select a country, year, and poverty line.");
      return;
    }

    setLoading(true);
    setError("");
    setLiveResult(null);

    try {
      const url = `${BACKEND_URL}/api/poverty/live?country=${selectedCountry}&year=${year}&line=${line}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setLiveResult(data);
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF]/10 via-[#FEEE91]/10 to-[#FFA239]/10">
      <main className="max-w-[1600px] mx-auto px-6 py-10">

        {/* ===== HEADER (VISIBLE) ===== */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] bg-clip-text text-transparent">
              Global Poverty Statistics
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Click a country to explore poverty statistics and stories
          </p>
        </div>

        {/* ===== CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Countries panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Countries</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(geoIdToCountryCode).map(([geoId, iso3]) => (
                <button
                  key={geoId}
                  onClick={() => handleCountryClick(geoId)}
                  className={`p-4 rounded-lg border text-left transition ${
                    selectedCountry === iso3
                      ? "border-[#FFA239] bg-[#FFA239]/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm text-gray-400">{geoId}</div>
                  <div className="font-semibold text-gray-800">
                    {countryNames[iso3]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>

            <div className="space-y-3">
              <input
                disabled
                value={selectedCountry ?? ""}
                placeholder="Country"
                className="w-full border rounded p-2 bg-gray-50"
              />

              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="w-full border rounded p-2"
              />

              <input
                value={line}
                onChange={(e) => setLine(e.target.value)}
                placeholder="Poverty line (USD/day)"
                className="w-full border rounded p-2"
              />

              <button
                onClick={handleFetch}
                disabled={loading}
                className="w-full py-2 rounded text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #FFA239 0%, #FF5656 100%)",
                }}
              >
                {loading ? "Loading..." : "Fetch & Cache Live Data"}
              </button>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {liveResult?.metric && (
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Headcount</div>
                    <div className="font-semibold">
                      {liveResult.metric.headcount}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Gap</div>
                    <div className="font-semibold">
                      {liveResult.metric.poverty_gap}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">Severity</div>
                    <div className="font-semibold">
                      {liveResult.metric.poverty_severity}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
