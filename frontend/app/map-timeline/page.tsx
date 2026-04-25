'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp } from 'lucide-react';
import { getPovertyLineForYear, getPovertyLineMetadata } from '../../data/historicalPovertyLines'; // Reymes - Added year-specific poverty line imports

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Dynamically import the map component to avoid SSR issues
const StatisticsMapLeaflet = dynamic(
  () => import('../../components/StatisticsMapLeaflet'),
  { ssr: false }
);

// Cache for map data to avoid redundant fetches
const mapDataCache = new Map<string, { data: MapRow[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

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

const MIN_YEAR = 1990;
const MAX_YEAR = 2020;

// Main component - Map Timeline
export default function MapTimelinePage() {
  const [selectedYear, setSelectedYear] = useState<number>(MAX_YEAR);
  const [debouncedYear, setDebouncedYear] = useState<number>(MAX_YEAR);
  // Keep previous data displayed while new year loads instead of going blank
  const [displayedData, setDisplayedData] = useState<MapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate years array at 5-year intervals
  const years = useMemo(() => {
    const all = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);
    return all.filter((y) => (y - MIN_YEAR) % 5 === 0);
  }, []);

  // Debounce year selection - wait 500ms before fetching
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedYear(selectedYear);
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedYear]);

  // Fetch map data when debounced year changes
  useEffect(() => {
    const fetchMapData = async () => {
      const cacheKey = `year_${debouncedYear}`;
      
      // Check cache first
      const cached = mapDataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setDisplayedData(cached.data);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s is enough for a single bulk call

        // Reymes - Get the poverty line for the selected year instead of using 2017 line
        const povertyLine = getPovertyLineForYear(debouncedYear);

        const response = await fetch(
          `${BACKEND_URL}/api/poverty/pip-map-bulk?year=${debouncedYear}&povline=${povertyLine}&maxAgeDays=365`,  // Reymes - Use year-specific poverty line
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} for year ${debouncedYear}`);
        }
        
        const data = await response.json();
        if (data.success && data.rows) {
          mapDataCache.set(cacheKey, { data: data.rows, timestamp: Date.now() });
          setDisplayedData(data.rows);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch poverty data');
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setError('Request timed out. The server may be fetching data for 200+ countries for the first time — please try again in a moment.');
          } else {
            setError(err.message || 'Failed to load map data. Please try again.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [debouncedYear]);


  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        paddingTop: 40,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 32, paddingLeft: 24 }}>
        <h1
          className="text-4xl sm:text-5xl font-bold"
          style={{ margin: '0 0 16px 0', color: 'var(--foreground)' }}
        >
          Poverty Rates Map Timeline
        </h1>
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
            fontSize: 18,
            lineHeight: 1.7,
            color: 'var(--color-gray-dark)',
          }}
        >
          <TrendingUp style={{ display: 'inline', width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />
          Explore how poverty rates have evolved across different countries over time.
          Use the year selector in the legend to navigate through decades and see the global
          poverty landscape change. Data sourced from World Bank's Poverty & Inequality Program (PIP).
        </p>
      </header>

      <p style={{ margin: '0 0 24px 24px', fontSize: 14, color: 'var(--color-gray-dark)' }}>
        Pick a year from the legend panel to update the map.
      </p>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginBottom: 24,
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            background: '#FF5656',
            border: '1px solid #DC143C',
            color: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
            ⚠ {error}
          </p>
        </div>
      )}

      <section className="map-and-legend-layout" style={{ marginTop: 32 }}>
        {/* Map container */}
        <div
          className="map-timeline-container"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-gray-dark)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            backgroundColor: '#a8c8e8',
            height: '600px',
            position: 'relative',
          }}
        >
          {/* Always show map if we have any data; overlay spinner while loading */}
          {displayedData.length > 0 && (
            <StatisticsMapLeaflet
              key={debouncedYear}
              selectedGeoId={null}
              onCountryClick={() => {}}
              mapRows={displayedData}
              showMarkers={false}
              rateType="international"
              containerClassName="relative w-full h-full"
              restrictBounds={true}
              showLegend={false}
            />
          )}

          {/* Loading overlay — only covers map, preserves previous year visible underneath */}
          {loading && (
            <div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.35)', zIndex: 10,
              }}
            >
              <div style={{
                background: 'var(--background)', borderRadius: 'var(--radius-lg)',
                padding: '24px 32px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-lg)',
              }}>
                <div style={{
                  width: 36, height: 36,
                  border: '3px solid var(--color-gray-dark)',
                  borderTop: '3px solid var(--color-cyan)',
                  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>
                  Loading {debouncedYear} data...
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-gray-dark)', textAlign: 'center', maxWidth: 240 }}>
                  Fetching all countries from World Bank PIP in one request — subsequent loads are instant.
                </p>
              </div>
            </div>
          )}

          {/* Empty state — only when not loading and truly no data */}
          {!loading && displayedData.length === 0 && (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--color-gray-dark)',
            }}>
              No data available for {debouncedYear}
            </div>
          )}
        </div>

        {/* Legend */}
        <aside
          className="timeline-side-legend"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-gray-light)',
            border: '1px solid var(--color-gray-dark)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--foreground)',
            }}
          >
            Poverty Rate Legend
          </h3>
          <p
            style={{
              margin: '0 0 14px 0',
              fontSize: 13,
              color: 'var(--color-gray-dark)',
              lineHeight: 1.45,
            }}
          >
            Snapshot for {debouncedYear}. Colors indicate the share of people living below the international poverty line.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="timeline-year-select"
              style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--color-gray-dark)', textTransform: 'uppercase', letterSpacing: 0.4 }}
            >
              Select year
            </label>
            <select
              id="timeline-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid var(--color-gray-dark)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                padding: '10px 12px',
                fontSize: 15,
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {selectedYear !== debouncedYear && (
              <p style={{ margin: '6px 0 0 0', fontSize: 12, color: 'var(--color-gray-dark)' }}>
                Applying selection for {selectedYear}...
              </p>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ border: '1px solid var(--color-gray-dark)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-gray-dark)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                Countries
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
                {displayedData.length}
              </p>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 10,
            }}
          >
            {[
              { rate: '> 40%', color: '#8B0000', label: 'Very High Poverty' },
              { rate: '30-40%', color: '#DC143C', label: 'High Poverty' },
              { rate: '20-30%', color: '#FF6347', label: 'Moderate Poverty' },
              { rate: '10-20%', color: '#FFA500', label: 'Low-Moderate Poverty' },
              { rate: '5-10%', color: '#FFD700', label: 'Low Poverty' },
              { rate: '< 5%', color: '#90EE90', label: 'Very Low Poverty' },
            ].map((item) => (
              <div key={item.rate} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: item.color,
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                  }}
                />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
                    {item.label}
                  </p>
                  {item.rate ? (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-gray-dark)' }}>
                      {item.rate}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 12,
              fontSize: 12,
              color: 'var(--color-gray-dark)',
              lineHeight: 1.45,
            }}
          >
            {/* Reymes - Display year-specific poverty line instead of hardcoded 2017 line */}
            Poverty line: ${getPovertyLineForYear(debouncedYear).toFixed(2)} per day ({getPovertyLineMetadata(debouncedYear).ppp}). Source: World Bank PIP.
          </div>
        </aside>
      </section>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .map-and-legend-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .timeline-side-legend {
          align-self: start;
        }
        @media (min-width: 1100px) {
          .map-and-legend-layout {
            grid-template-columns: minmax(0, 2.2fr) minmax(300px, 1fr);
            align-items: stretch;
          }
          .timeline-side-legend {
            height: 600px;
            overflow-y: hidden;
          }
        }
        .map-timeline-container .leaflet-container { background: #a8c8e8 !important; }
      `}</style>
    </div>
  );
}
