"use client"

import React, { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import * as GeoJSON from "geojson"
import "leaflet/dist/leaflet.css"
// Added by Reymes 3/2/26 - import rate data files for filter support
import { NATIONAL_POVERTY_RATES } from "../data/nationalRates"
import { normalizeRate } from "../data/internationalRates"
//Reymes Olide 1/31/26 - Leaflet map component with country coloring
//Reymes Olide 2/10/26 - Added poverty rate coloring, names on hover, and poverty rates on hover.
// Rows returned from /api/poverty/pip-map - added by Christella, 02/03/2026
type MapRow = {
  country: string // ISO3
  headcount: number | null
  poverty_gap?: number | null
  poverty_severity?: number | null
  year: number
  povline: number
  fetchedAt?: string
  source?: string
  error?: string
}
// End of addition by Christella, 02/03/2026
// Function to get color based on poverty rate 2/10/26 - Reymes Olide
// Updated 2/20/26 - Improved color visibility - Reymes
function getPovertyColor(povertyRate: number | null | undefined): string {
  if (povertyRate === null || povertyRate === undefined) return "#E8E8E8" // Very light gray - untracked country
  if (povertyRate > 40) return "#8B0000" // Dark red - very high poverty
  if (povertyRate > 30) return "#DC143C" // Crimson - high poverty
  if (povertyRate > 20) return "#FF6347" // Tomato - moderate poverty
  if (povertyRate > 10) return "#FFA500" // Orange - low-moderate poverty
  if (povertyRate > 5) return "#FFD700" // Gold - low poverty
  return "#90EE90" // Light green - very low poverty
}

type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
  mapRows: MapRow[]
  showMarkers?: boolean
  rateType?: "national" | "international"; // Added by Reymes 3/2/26
}

// National rates now imported from data/nationalRates.ts - Reymes 3/2/26
// Mapping of geoId to country coordinates and names
//updated by Reymes 2/13/26
// Updated 2/20/26 - Added more countries Reymes
// Organized by continent - 2/20/26 Reymes
const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  // AFRICA
  "12": { lat: 28.0339, lng: 1.6596, name: "Algeria" },
  "24": { lat: -11.2027, lng: 17.8739, name: "Angola" },
  "204": { lat: 9.3077, lng: 2.3158, name: "Benin" },
  "72": { lat: -22.3285, lng: 24.6849, name: "Botswana" },
  "854": { lat: 12.2383, lng: -1.5616, name: "Burkina Faso" },
  "108": { lat: -3.3731, lng: 29.9189, name: "Burundi" },
  "120": { lat: 7.3697, lng: 12.3547, name: "Cameroon" },
  "140": { lat: 6.6111, lng: 20.9394, name: "Central African Republic" },
  "148": { lat: 15.4542, lng: 18.7322, name: "Chad" },
  "178": { lat: -0.2280, lng: 15.8277, name: "Congo" },
  "180": { lat: -4.0383, lng: 21.7587, name: "Democratic Republic of the Congo" },
  "384": { lat: 7.5400, lng: -5.5471, name: "Côte d'Ivoire" },
  "818": { lat: 26.8206, lng: 30.8025, name: "Egypt" },
  "231": { lat: 9.145, lng: 40.4897, name: "Ethiopia" },
  "748": { lat: -26.5225, lng: 31.4659, name: "Eswatini" },
  "266": { lat: -0.8037, lng: 11.6094, name: "Gabon" },
  "270": { lat: 13.4432, lng: -15.3101, name: "Gambia" },
  "288": { lat: 7.9465, lng: -1.0232, name: "Ghana" },
  "324": { lat: 9.9456, lng: -9.6966, name: "Guinea" },
  "404": { lat: -0.0236, lng: 37.9062, name: "Kenya" },
  "426": { lat: -29.6100, lng: 28.2336, name: "Lesotho" },
  "430": { lat: 6.4281, lng: -9.4295, name: "Liberia" },
  "450": { lat: -18.7669, lng: 46.8691, name: "Madagascar" },
  "454": { lat: -13.2543, lng: 34.3015, name: "Malawi" },
  "466": { lat: 17.5707, lng: -3.9962, name: "Mali" },
  "478": { lat: 21.0079, lng: -10.9408, name: "Mauritania" },
  "504": { lat: 31.7917, lng: -7.0926, name: "Morocco" },
  "508": { lat: -18.6657, lng: 35.5296, name: "Mozambique" },
  "516": { lat: -22.9576, lng: 18.4904, name: "Namibia" },
  "562": { lat: 17.6078, lng: 8.0817, name: "Niger" },
  "566": { lat: 9.082, lng: 8.6753, name: "Nigeria" },
  "646": { lat: -1.9403, lng: 29.8739, name: "Rwanda" },
  "686": { lat: 14.4974, lng: -14.4524, name: "Senegal" },
  "694": { lat: 8.4606, lng: -11.7799, name: "Sierra Leone" },
  "710": { lat: -30.5595, lng: 22.9375, name: "South Africa" },
  "729": { lat: 12.8628, lng: 30.2176, name: "Sudan" },
  "834": { lat: -6.3690, lng: 34.8888, name: "Tanzania" },
  "768": { lat: 8.6195, lng: 0.8248, name: "Togo" },
  "788": { lat: 33.8869, lng: 9.5375, name: "Tunisia" },
  "800": { lat: 1.3733, lng: 32.2903, name: "Uganda" },
  "894": { lat: -13.1339, lng: 27.8493, name: "Zambia" },
  "716": { lat: -19.0154, lng: 29.1549, name: "Zimbabwe" },
  
  // ASIA
  "50": { lat: 23.685, lng: 90.3563, name: "Bangladesh" },
  "356": { lat: 20.5937, lng: 78.9629, name: "India" },
  "392": { lat: 36.2048, lng: 138.2529, name: "Japan" },
  "410": { lat: 35.9078, lng: 127.7669, name: "South Korea" },
  
  // EUROPE
  "40": { lat: 47.5162, lng: 14.5501, name: "Austria" },
  "56": { lat: 50.5039, lng: 4.4699, name: "Belgium" },
  "250": { lat: 46.2276, lng: 2.2137, name: "France" },
  "276": { lat: 51.1657, lng: 10.4515, name: "Germany" },
  "380": { lat: 41.8719, lng: 12.5674, name: "Italy" },
  "528": { lat: 52.1326, lng: 5.2913, name: "Netherlands" },
  "578": { lat: 60.4720, lng: 8.4689, name: "Norway" },
  "724": { lat: 40.4637, lng: -3.7492, name: "Spain" },
  "752": { lat: 60.1282, lng: 18.6435, name: "Sweden" },
  "756": { lat: 46.8182, lng: 8.2275, name: "Switzerland" },
  "826": { lat: 55.3781, lng: -3.4360, name: "United Kingdom" },
  
  // NORTH AMERICA
  "124": { lat: 56.1304, lng: -106.3468, name: "Canada" },
  "484": { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  "840": { lat: 37.0902, lng: -95.7129, name: "United States" },
  
  // SOUTH AMERICA
  "76": { lat: -14.235, lng: -51.9253, name: "Brazil" },
  
  // OCEANIA
  "36": { lat: -25.2744, lng: 133.7751, name: "Australia" },
}

// Mapping of country names to ISO3 codes and GeoJSON country names 
//Updated countires 2/13/26
// Updated 2/20/26 - Added more developed countries Reymes
// Organized by continent Reymes
const COUNTRY_CODE_MAP: Record<string, { iso3: string; name: string; geojsonName: string }> = {
  // AFRICA
  "12": { iso3: "DZA", name: "Algeria", geojsonName: "Algeria" },
  "24": { iso3: "AGO", name: "Angola", geojsonName: "Angola" },
  "204": { iso3: "BEN", name: "Benin", geojsonName: "Benin" },
  "72": { iso3: "BWA", name: "Botswana", geojsonName: "Botswana" },
  "854": { iso3: "BFA", name: "Burkina Faso", geojsonName: "Burkina Faso" },
  "108": { iso3: "BDI", name: "Burundi", geojsonName: "Burundi" },
  "120": { iso3: "CMR", name: "Cameroon", geojsonName: "Cameroon" },
  "140": { iso3: "CAF", name: "Central African Republic", geojsonName: "Central African Republic" },
  "148": { iso3: "TCD", name: "Chad", geojsonName: "Chad" },
  "178": { iso3: "COG", name: "Congo", geojsonName: "Republic of the Congo" },
  "180": { iso3: "COD", name: "Democratic Republic of the Congo", geojsonName: "Democratic Republic of the Congo" },
  "384": { iso3: "CIV", name: "Côte d'Ivoire", geojsonName: "Ivory Coast" },
  "818": { iso3: "EGY", name: "Egypt", geojsonName: "Egypt" },
  "231": { iso3: "ETH", name: "Ethiopia", geojsonName: "Ethiopia" },
  "748": { iso3: "SWZ", name: "Eswatini", geojsonName: "Swaziland" },
  "266": { iso3: "GAB", name: "Gabon", geojsonName: "Gabon" },
  "270": { iso3: "GMB", name: "Gambia", geojsonName: "Gambia" },
  "288": { iso3: "GHA", name: "Ghana", geojsonName: "Ghana" },
  "324": { iso3: "GIN", name: "Guinea", geojsonName: "Guinea" },
  "404": { iso3: "KEN", name: "Kenya", geojsonName: "Kenya" },
  "426": { iso3: "LSO", name: "Lesotho", geojsonName: "Lesotho" },
  "430": { iso3: "LBR", name: "Liberia", geojsonName: "Liberia" },
  "450": { iso3: "MDG", name: "Madagascar", geojsonName: "Madagascar" },
  "454": { iso3: "MWI", name: "Malawi", geojsonName: "Malawi" },
  "466": { iso3: "MLI", name: "Mali", geojsonName: "Mali" },
  "478": { iso3: "MRT", name: "Mauritania", geojsonName: "Mauritania" },
  "504": { iso3: "MAR", name: "Morocco", geojsonName: "Morocco" },
  "508": { iso3: "MOZ", name: "Mozambique", geojsonName: "Mozambique" },
  "516": { iso3: "NAM", name: "Namibia", geojsonName: "Namibia" },
  "562": { iso3: "NER", name: "Niger", geojsonName: "Niger" },
  "566": { iso3: "NGA", name: "Nigeria", geojsonName: "Nigeria" },
  "646": { iso3: "RWA", name: "Rwanda", geojsonName: "Rwanda" },
  "686": { iso3: "SEN", name: "Senegal", geojsonName: "Senegal" },
  "694": { iso3: "SLE", name: "Sierra Leone", geojsonName: "Sierra Leone" },
  "710": { iso3: "ZAF", name: "South Africa", geojsonName: "South Africa" },
  "729": { iso3: "SDN", name: "Sudan", geojsonName: "Sudan" },
  "834": { iso3: "TZA", name: "Tanzania", geojsonName: "Tanzania" },
  "768": { iso3: "TGO", name: "Togo", geojsonName: "Togo" },
  "788": { iso3: "TUN", name: "Tunisia", geojsonName: "Tunisia" },
  "800": { iso3: "UGA", name: "Uganda", geojsonName: "Uganda" },
  "894": { iso3: "ZMB", name: "Zambia", geojsonName: "Zambia" },
  "716": { iso3: "ZWE", name: "Zimbabwe", geojsonName: "Zimbabwe" },

  // ASIA
  "50": { iso3: "BGD", name: "Bangladesh", geojsonName: "Bangladesh" },
  "356": { iso3: "IND", name: "India", geojsonName: "India" },
  "392": { iso3: "JPN", name: "Japan", geojsonName: "Japan" },
  "410": { iso3: "KOR", name: "South Korea", geojsonName: "South Korea" },

  // EUROPE
  "40": { iso3: "AUT", name: "Austria", geojsonName: "Austria" },
  "56": { iso3: "BEL", name: "Belgium", geojsonName: "Belgium" },
  "250": { iso3: "FRA", name: "France", geojsonName: "France" },
  "276": { iso3: "DEU", name: "Germany", geojsonName: "Germany" },
  "380": { iso3: "ITA", name: "Italy", geojsonName: "Italy" },
  "528": { iso3: "NLD", name: "Netherlands", geojsonName: "Netherlands" },
  "578": { iso3: "NOR", name: "Norway", geojsonName: "Norway" },
  "724": { iso3: "ESP", name: "Spain", geojsonName: "Spain" },
  "752": { iso3: "SWE", name: "Sweden", geojsonName: "Sweden" },
  "756": { iso3: "CHE", name: "Switzerland", geojsonName: "Switzerland" },
  "826": { iso3: "GBR", name: "United Kingdom", geojsonName: "United Kingdom" },

  // NORTH AMERICA
  "124": { iso3: "CAN", name: "Canada", geojsonName: "Canada" },
  "484": { iso3: "MEX", name: "Mexico", geojsonName: "Mexico" },
  "840": { iso3: "USA", name: "United States", geojsonName: "United States of America" },

  // SOUTH AMERICA
  "76": { iso3: "BRA", name: "Brazil", geojsonName: "Brazil" },

  // OCEANIA
  "36": { iso3: "AUS", name: "Australia", geojsonName: "Australia" },
}

function MapFlyTo({ selectedGeoId, onMapReady }: { selectedGeoId: string | null; onMapReady?: (map: L.Map) => void }) {
  const map = useMap()
  // Added by Reymes 3/2/26 - prevent repeated flyTo on same selected country
  const lastFlownGeoIdRef = useRef<string | null>(null)

  useEffect(() => {
    onMapReady?.(map)
  }, [map, onMapReady])

  useEffect(() => {
    if (!selectedGeoId) return
    // Added by Reymes 3/2/26 - skip flyTo if selection did not change
    if (lastFlownGeoIdRef.current === selectedGeoId) return
    const c = COORDS[selectedGeoId]
    if (!c) return
    // Added by Reymes 3/2/26 - persist last flown country to prevent repeated recentering
    lastFlownGeoIdRef.current = selectedGeoId
    map.flyTo([c.lat, c.lng], 4, { duration: 0.8 })
  }, [selectedGeoId, map])

  return null
}

export default function StatisticsMapLeaflet({
  selectedGeoId,
  onCountryClick,
  mapRows,
  rateType = "national",
}: Props) {
  const [geojsonData, setGeojsonData] = useState<{ features: Record<string, unknown>[] } | null>(null)
  const [map, setMap] = useState<L.Map | null>(null)

  // Load GeoJSON data
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        console.log("GeoJSON loaded, features:", data.features.length)
        setGeojsonData(data)
      })
      .catch((err) => console.error("Failed to load GeoJSON:", err))
  }, [])
  // Updated by Reymes 3/2/26 - use national poverty rates for developed countries
  // Create a map of country ISO3 to poverty rate from mapRows
  const povertyRateMap = React.useMemo(() => {
    const rates: Record<string, number> = {}

    const rowsByIso: Record<string, MapRow> = {}
    if (Array.isArray(mapRows) && mapRows.length > 0) {
      mapRows.forEach((row) => {
        if (!row?.country) return
        rowsByIso[row.country.toUpperCase()] = row
      })
    }

    Object.entries(COUNTRY_CODE_MAP).forEach(([geoId, mapping]) => {
      const iso3 = mapping.iso3
      const row = rowsByIso[iso3]
      const raw = row?.headcount

      // Added by Reymes 3/2/26 - apply filter logic: national shows national rates, international shows API only
      if (rateType === "national") {
        // National filter: strict national-only mode (no international fallback)
        const nationalData = NATIONAL_POVERTY_RATES[iso3]
        if (nationalData && typeof nationalData.rate === "number") {
          rates[geoId] = nationalData.rate
        }
      } else {
        // International filter: only use API data, skip national rate overrides
        if (typeof raw === "number" && Number.isFinite(raw)) {
          const normalized = normalizeRate(raw)
          if (normalized !== null) {
            rates[geoId] = normalized
            return
          }
        }
      }
    })

    return rates
  }, [mapRows, rateType])

  // Add countries to map
  useEffect(() => {
    if (!geojsonData?.features || !map) {
      return
    }

    console.log("Adding countries to map...")
    console.log("povertyRateMap:", povertyRateMap)
    console.log("Total countries in povertyRateMap:", Object.keys(povertyRateMap).length) //debugging log to check how many countries have poverty rates in our map - Reymes

    const layers: L.GeoJSON[] = []
    let matchedCount = 0
    const unmatchedCountries: string[] = [] // For logging unmatched countries - Reymes

    geojsonData.features.forEach((feature: Record<string, unknown>) => {
      const countryName = (feature.properties as Record<string, unknown>)?.name as string
      if (!countryName) return

      let matchingGeoId: string | null = null
      for (const [geoId, mapping] of Object.entries(COUNTRY_CODE_MAP)) {
        if (mapping.geojsonName === countryName) {
          matchingGeoId = geoId
          break
        }
      }

      if (matchingGeoId) {
        matchedCount++
      } else {
        unmatchedCountries.push(countryName) // Add to unmatched list for logging - Reymes
      }

      // Get poverty rate if this is a tracked country, otherwise use default
      const povertyRate = matchingGeoId ? povertyRateMap[matchingGeoId] : null
      // Use purple for tracked countries with no data, grey for untracked countries - Reymes 2/20/26
      let baseColor;
      if (matchingGeoId && (povertyRate === null || povertyRate === undefined)) {
        baseColor = "#9370DB"; // Purple for tracked but no data available
      } else {
        baseColor = getPovertyColor(povertyRate);
      }

      if (matchingGeoId && povertyRate !== null && povertyRate !== undefined) {
        console.log(`${countryName} (geoId: ${matchingGeoId}): povertyRate=${povertyRate?.toFixed(2)}%, color=${baseColor}`) // Debug log to check poverty rates and colors for matched countries - Reymes
      } else if (matchingGeoId) {
        console.log(`${countryName} (geoId: ${matchingGeoId}): NO DATA AVAILABLE (purple)`) // Log tracked countries with no data - Reymes
      }

      const layer = L.geoJSON(feature as unknown as GeoJSON.Feature, {
        style: () => ({
          fillColor: baseColor,
          color: matchingGeoId ? "#333" : "#999",  // Lighter border for untracked countries Reymes
          weight: matchingGeoId ? 1 : 0.5,
          opacity: 1,
          fillOpacity: matchingGeoId ? 0.8 : 0.3,  // More opacity for tracked countries, less for untracked Reymes
        }),
      })

      layer.eachLayer((subLayer: L.Layer) => {
        // Only add tooltip and click handler if this is a tracked country
        if (matchingGeoId) {
          // Added by Reymes 3/2/26 - include national poverty line in tooltip when available
          let tooltipContent: string;
          if (povertyRate !== null && povertyRate !== undefined) {
            const countryIso = COUNTRY_CODE_MAP[matchingGeoId]?.iso3;
            const nationalData = countryIso ? NATIONAL_POVERTY_RATES[countryIso] : null;
            let povLineInfo = "";
            // Added by Reymes 3/2/26 - only show national poverty line when in national filter mode
            if (rateType === "national" && nationalData && typeof nationalData === "object" && "povLine" in nationalData) {
              povLineInfo = `<div style="font-size: 0.7rem; color: #555;">Line: ${nationalData.povLine.toLocaleString()} ${nationalData.currency}/yr</div>`;
            }
            tooltipContent = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem;">Poverty Rate: ${povertyRate.toFixed(2)}%</div>${povLineInfo}`;
          } else {
            tooltipContent = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem; color: #9370DB;">No data available</div>`;
          }
          (subLayer as L.Path).bindTooltip(tooltipContent)
          subLayer.on("click", () => {
            console.log("Clicked:", matchingGeoId)
            onCountryClick(matchingGeoId!)
          })
          subLayer.on("mouseover", () => {
            (subLayer as L.Path).setStyle({ fillColor: "#FFD700", weight: 2 })
          })
          subLayer.on("mouseout", () => {
            (subLayer as L.Path).setStyle({ fillColor: baseColor, weight: 1 })
          })
        }
      })

      layer.addTo(map)
      layers.push(layer)
    })

    console.log(`Added ${layers.length} country layers (${matchedCount} matched to our data)`)
    if (unmatchedCountries.length > 0) {
      console.log("Unmatched countries:", unmatchedCountries.slice(0, 10).join(", "), unmatchedCountries.length > 10 ? `... and ${unmatchedCountries.length - 10} more` : "") //debugging log to check which countries in the GeoJSON did not match our mapping - Reymes
    }

    return () => {
      layers.forEach((layer) => map.removeLayer(layer))
    }
  }, [geojsonData, map, povertyRateMap, onCountryClick, rateType])

  return (
    <div className="relative w-full h-[360px] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        minZoom={2}
        maxZoom={6}
        maxBounds={[[-85, -180], [85, 180]]}
        // Added by Reymes 3/2/26 - soften bounds lock to reduce stuck-on-USA feel
        maxBoundsViscosity={0.5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo selectedGeoId={selectedGeoId} onMapReady={setMap} />
      </MapContainer>

      {/* Added by Reymes 3/2/26 - bottom-left map legend */}
      <div
        className="absolute bottom-3 left-3 z-[1000] rounded-md px-3 py-2 text-xs shadow-md"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.92)", color: "#222" }}
      >
        <div className="font-semibold mb-1">Poverty rate key</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#8B0000" }} />&gt; 40%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#DC143C" }} />30% - 40%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FF6347" }} />20% - 30%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFA500" }} />10% - 20%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFD700" }} />5% - 10%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#90EE90" }} />0% - 5%</div>
        <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#9370DB" }} />Tracked, missing data</div>
      </div>
    </div>
  )
}
