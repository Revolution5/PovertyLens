"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
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
function getPovertyColor(povertyRate: number | null | undefined): string {
  if (povertyRate === null || povertyRate === undefined) return "#D3D3D3" // Light gray - untracked country
  if (povertyRate > 40) return "#8B0000" // Dark red - very high poverty
  if (povertyRate > 30) return "#DC143C" // Crimson - high poverty
  if (povertyRate > 20) return "#FF6347" // Tomato - moderate poverty
  if (povertyRate > 10) return "#FFA500" // Orange - low-moderate poverty
  return "#FFD700" // Gold - low poverty
}

type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
  mapRows: MapRow[]
  showMarkers?: boolean
}
// Mapping of geoId to country coordinates and names
//updated by Reymes 2/13/26
const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  "36": { lat: -25.2744, lng: 133.7751, name: "Australia" },
  "50": { lat: 23.685, lng: 90.3563, name: "Bangladesh" },
  "76": { lat: -14.235, lng: -51.9253, name: "Brazil" },
  "124": { lat: 56.1304, lng: -106.3468, name: "Canada" },
  "231": { lat: 9.145, lng: 40.4897, name: "Ethiopia" },
  "250": { lat: 46.2276, lng: 2.2137, name: "France" },
  "276": { lat: 51.1657, lng: 10.4515, name: "Germany" },
  "356": { lat: 20.5937, lng: 78.9629, name: "India" },
  "380": { lat: 41.8719, lng: 12.5674, name: "Italy" },
  "392": { lat: 36.2048, lng: 138.2529, name: "Japan" },
  "404": { lat: -0.0236, lng: 37.9062, name: "Kenya" },
  "410": { lat: 35.9078, lng: 127.7669, name: "South Korea" },
  "484": { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  "566": { lat: 9.082, lng: 8.6753, name: "Nigeria" },
  "724": { lat: 40.4637, lng: -3.7492, name: "Spain" },
  "826": { lat: 55.3781, lng: -3.4360, name: "United Kingdom" },
  "840": { lat: 37.0902, lng: -95.7129, name: "United States" },
}

// Mapping of country names to ISO3 codes and GeoJSON country names 
//Updated countires 2/13/26
const COUNTRY_CODE_MAP: Record<string, { iso3: string; name: string; geojsonName: string }> = {
  "36": { iso3: "AUS", name: "Australia", geojsonName: "Australia" },
  "50": { iso3: "BGD", name: "Bangladesh", geojsonName: "Bangladesh" },
  "76": { iso3: "BRA", name: "Brazil", geojsonName: "Brazil" },
  "124": { iso3: "CAN", name: "Canada", geojsonName: "Canada" },
  "231": { iso3: "ETH", name: "Ethiopia", geojsonName: "Ethiopia" },
  "250": { iso3: "FRA", name: "France", geojsonName: "France" },
  "276": { iso3: "DEU", name: "Germany", geojsonName: "Germany" },
  "356": { iso3: "IND", name: "India", geojsonName: "India" },
  "380": { iso3: "ITA", name: "Italy", geojsonName: "Italy" },
  "392": { iso3: "JPN", name: "Japan", geojsonName: "Japan" },
  "404": { iso3: "KEN", name: "Kenya", geojsonName: "Kenya" },
  "410": { iso3: "KOR", name: "South Korea", geojsonName: "South Korea" },
  "484": { iso3: "MEX", name: "Mexico", geojsonName: "Mexico" },
  "566": { iso3: "NGA", name: "Nigeria", geojsonName: "Nigeria" },
  "724": { iso3: "ESP", name: "Spain", geojsonName: "Spain" },
  "826": { iso3: "GBR", name: "United Kingdom", geojsonName: "United Kingdom" },
  "840": { iso3: "USA", name: "United States", geojsonName: "United States of America" },
}

function MapFlyTo({ selectedGeoId, onMapReady }: { selectedGeoId: string | null; onMapReady?: (map: L.Map) => void }) {
  const map = useMap()

  useEffect(() => {
    onMapReady?.(map)
  }, [map, onMapReady])

  useEffect(() => {
    if (!selectedGeoId) return
    const c = COORDS[selectedGeoId]
    if (!c) return
    map.flyTo([c.lat, c.lng], 4, { duration: 0.8 })
  }, [selectedGeoId, map])

  return null
}

export default function StatisticsMapLeaflet({
  selectedGeoId,
  onCountryClick,
  mapRows,
  showMarkers = true,
}: Props) {
  const [hoveredGeoId, setHoveredGeoId] = useState<string | null>(null)
  const [geojsonData, setGeojsonData] = useState<any>(null)
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
  //Added by Reymes 2/13/26 to use national poverty rates for developed countries
  // National poverty rates for developed countries (using national poverty lines)
  // Added to account for different poverty standards - international vs national
  const NATIONAL_POVERTY_RATES: Record<string, number> = {
    "USA": 10.6,    // US Census Bureau 2023
    "CAN": 9.4,     // Statistics Canada
    "GBR": 18.0,    // UK relative poverty
    "DEU": 14.8,    // Germany
    "FRA": 14.5,    // France
    "JPN": 15.7,    // Japan
    "AUS": 13.4,    // Australia
    "ITA": 20.1,    // Italy
    "ESP": 20.4,    // Spain
    "KOR": 16.7,    // South Korea
  };

  // Create a map of country ISO3 to poverty rate from mapRows
  const povertyRateMap = React.useMemo(() => {
    const rates: Record<string, number> = {}
    
    const geoIdToIso3: Record<string, string> = {
      "36": "AUS",
      "50": "BGD",
      "76": "BRA",
      "124": "CAN",
      "231": "ETH",
      "250": "FRA",
      "276": "DEU",
      "356": "IND",
      "380": "ITA",
      "392": "JPN",
      "404": "KEN",
      "410": "KOR",
      "484": "MEX",
      "566": "NGA",
      "724": "ESP",
      "826": "GBR",
      "840": "USA",
    }

    if (Array.isArray(mapRows) && mapRows.length > 0) {
      mapRows.forEach((row) => {
        if (row.country && row.headcount !== null && row.headcount > 0) {
          // Find the geoId for this ISO3 country code
          const geoId = Object.entries(geoIdToIso3).find(
            ([, iso3]) => iso3 === row.country.toUpperCase()
          )?.[0]
          if (geoId) {
            const iso3 = row.country.toUpperCase();
            // Use national poverty rate if available, otherwise use World Bank international line
            //Reymes 2/13/26
            if (NATIONAL_POVERTY_RATES[iso3]) {
              rates[geoId] = NATIONAL_POVERTY_RATES[iso3];
            } else {
              // Convert decimal to percentage (API returns 0.0096 as 0.96%)
              rates[geoId] = row.headcount * 100;
            }
          }
        }
      })
    }

    return rates
  }, [mapRows])

  // Add countries to map
  useEffect(() => {
    if (!geojsonData?.features || !map) {
      return
    }

    console.log("Adding countries to map...")
    console.log("povertyRateMap:", povertyRateMap)

    const layers: L.GeoJSON[] = []

    geojsonData.features.forEach((feature: any) => {
      const countryName = feature.properties?.name
      if (!countryName) return

      let matchingGeoId: string | null = null
      for (const [geoId, mapping] of Object.entries(COUNTRY_CODE_MAP)) {
        if (mapping.geojsonName === countryName) {
          matchingGeoId = geoId
          break
        }
      }

      // Get poverty rate if this is a tracked country, otherwise use default
      const povertyRate = matchingGeoId ? povertyRateMap[matchingGeoId] : null
      const baseColor = getPovertyColor(povertyRate)

      if (matchingGeoId) {
        console.log(`${countryName} (geoId: ${matchingGeoId}): povertyRate=${povertyRate}, color=${baseColor}`)
      }

      const layer = L.geoJSON(feature, {
        style: (feature) => ({
          fillColor: baseColor,
          color: "#333",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7,
        }),
      })

      layer.eachLayer((subLayer: any) => {
        // Only add tooltip and click handler if this is a tracked country
        if (matchingGeoId) {
          const tooltip = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem;">Poverty Rate: ${povertyRate?.toFixed(2)}%</div>`
          subLayer.bindTooltip(tooltip)
          subLayer.on("click", () => {
            console.log("Clicked:", matchingGeoId)
            onCountryClick(matchingGeoId!)
          })
          subLayer.on("mouseover", () => {
            setHoveredGeoId(matchingGeoId)
            subLayer.setStyle({ fillColor: "#FFD700", weight: 2 })
          })
          subLayer.on("mouseout", () => {
            setHoveredGeoId(null)
            subLayer.setStyle({ fillColor: baseColor, weight: 1 })
          })
        }
      })

      layer.addTo(map)
      layers.push(layer)
    })

    console.log("Added", layers.length, "country layers")

    return () => {
      layers.forEach((layer) => map.removeLayer(layer))
    }
  }, [geojsonData, map, povertyRateMap, onCountryClick, setHoveredGeoId])

  return (
    <div className="w-full h-[360px] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        minZoom={2}
        maxZoom={6}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo selectedGeoId={selectedGeoId} onMapReady={setMap} />
      </MapContainer>
    </div>
  )
}
