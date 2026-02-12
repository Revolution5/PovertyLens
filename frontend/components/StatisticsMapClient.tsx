"use client"
//Reymes Olide 1/31/26 - Dynamic import wrapper for Leaflet map component
import React, { useEffect, useState } from "react"

// Rows returned from /api/poverty/pip-map - added by Christella on 02/03/2026
type MapRow = {
  country: string
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

type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
  mapRows: MapRow[]
  showMarkers?: boolean; // Added by Christella, 02/03/2026
}

export default function StatisticsMapClient({ selectedGeoId, onCountryClick, mapRows, showMarkers = true, }: Props) {
  const [Component, setComponent] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    import("./StatisticsMapLeaflet")
      .then((mod) => {
        if (mounted) setComponent(() => mod.default)
      })
      .catch((err) => {
        console.error("Failed to load leaflet map:", err)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      {Component ? (
        <Component selectedGeoId={selectedGeoId} onCountryClick={onCountryClick} mapRows={mapRows} showMarkers={showMarkers}/>
      ) : (
        <div className="w-full h-[360px] rounded-lg bg-gray-50 flex items-center justify-center">
          Loading map...
        </div>
      )}
    </div>
  )
}
