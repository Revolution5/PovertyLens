"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
//Reymes Olide 1/31/26 - Leaflet map component with country coloring

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

// Function to get color based on poverty rate
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

const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  "50": { lat: 23.685, lng: 90.3563, name: "Bangladesh" },
  "76": { lat: -14.235, lng: -51.9253, name: "Brazil" },
  "231": { lat: 9.145, lng: 40.4897, name: "Ethiopia" },
  "356": { lat: 20.5937, lng: 78.9629, name: "India" },
  "404": { lat: -0.0236, lng: 37.9062, name: "Kenya" },
  "484": { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  "566": { lat: 9.082, lng: 8.6753, name: "Nigeria" },
  "840": { lat: 37.0902, lng: -95.7129, name: "United States" },
}

// Mapping of country names to ISO3 codes and GeoJSON country names
const COUNTRY_CODE_MAP: Record<string, { iso3: string; name: string; geojsonName: string }> = {
  "50": { iso3: "BGD", name: "Bangladesh", geojsonName: "Bangladesh" },
  "76": { iso3: "BRA", name: "Brazil", geojsonName: "Brazil" },
  "231": { iso3: "ETH", name: "Ethiopia", geojsonName: "Ethiopia" },
  "356": { iso3: "IND", name: "India", geojsonName: "India" },
  "404": { iso3: "KEN", name: "Kenya", geojsonName: "Kenya" },
  "484": { iso3: "MEX", name: "Mexico", geojsonName: "Mexico" },
  "566": { iso3: "NGA", name: "Nigeria", geojsonName: "Nigeria" },
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

  // Create a map of country ISO3 to poverty rate from mapRows
  const povertyRateMap = React.useMemo(() => {
    const rates: Record<string, number> = {}
    
    const geoIdToIso3: Record<string, string> = {
      "50": "BGD",
      "76": "BRA",
      "231": "ETH",
      "356": "IND",
      "404": "KEN",
      "484": "MEX",
      "566": "NGA",
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
            // Convert decimal to percentage (API returns 0.0096 as 0.96%)
            rates[geoId] = row.headcount * 100
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