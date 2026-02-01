"use client"
//Reymes Olide 1/31/26 - Dynamic import wrapper for Leaflet map component
import React, { useEffect, useState } from 'react'

type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
}

export default function StatisticsMapClient({ selectedGeoId, onCountryClick }: Props) {
  const [Component, setComponent] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    import('./StatisticsMapLeaflet')
      .then((mod) => {
        if (mounted) setComponent(() => mod.default)
      })
      .catch((err) => {
        console.error('Failed to load leaflet map:', err)
      })
    return () => { mounted = false }
  }, [])

  return (
    <div>
      {Component ? (
        <Component selectedGeoId={selectedGeoId} onCountryClick={onCountryClick} />
      ) : (
        <div className="w-full h-[360px] rounded-lg bg-gray-50 flex items-center justify-center">Loading map...</div>
      )}
    </div>
  )
}