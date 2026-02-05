"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
//Reymes Olide 1/31/26 - Leaflet map component

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

function MapFlyTo({ selectedGeoId }: { selectedGeoId: string | null }) {
  const map = useMap()

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
  // Decide which markers should be visible based on fetched poverty dataset
  const visibleGeoIds = React.useMemo(() => {
    // If markers are disabled, return empty list immediately
    if (!showMarkers) return []

    if (!Array.isArray(mapRows) || mapRows.length === 0) {
      return Object.keys(COORDS)
    }

    const iso3Set = new Set(
      mapRows
        .filter((r) => typeof r?.country === "string" && (r.headcount ?? 0) > 0)
        .map((r) => r.country.toUpperCase())
    )

    // Map this file's geoId keys to ISO3 codes
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

    return Object.keys(COORDS).filter((geoId) => iso3Set.has(geoIdToIso3[geoId]))
  }, [mapRows, showMarkers])

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

        <MapFlyTo selectedGeoId={selectedGeoId} />

        {/* Only render markers when showMarkers is true */}
        {showMarkers &&
          Object.entries(COORDS)
            .filter(([geoId]) => visibleGeoIds.includes(geoId))
            .map(([geoId, c]) => (
              <CircleMarker
                key={geoId}
                center={[c.lat, c.lng]}
                radius={selectedGeoId === geoId ? 8 : 6}
                pathOptions={{
                  color: selectedGeoId === geoId ? "#FF5656" : "#FFA239",
                  fillColor: selectedGeoId === geoId ? "#FF5656" : "#FFA239",
                  fillOpacity: 1,
                }}
                eventHandlers={{ click: () => onCountryClick(geoId) }}
              >
                <Tooltip direction="right" offset={[8,0]} opacity={1}>
                  <div className="text-sm font-semibold"
                  >{c.name} ({geoId}) </div>
                </Tooltip>
              </CircleMarker>
            ))}
      </MapContainer>
    </div>
  )
}
