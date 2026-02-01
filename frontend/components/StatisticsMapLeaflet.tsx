"use client"

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
//Reymes Olide 1/31/26 - Leaflet map component
type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
}

const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  '50': { lat: 23.6850, lng: 90.3563, name: 'Bangladesh' },
  '76': { lat: -14.2350, lng: -51.9253, name: 'Brazil' },
  '231': { lat: 9.1450, lng: 40.4897, name: 'Ethiopia' },
  '356': { lat: 20.5937, lng: 78.9629, name: 'India' },
  '404': { lat: -0.0236, lng: 37.9062, name: 'Kenya' },
  '484': { lat: 23.6345, lng: -102.5528, name: 'Mexico' },
  '566': { lat: 9.0820, lng: 8.6753, name: 'Nigeria' },
  '840': { lat: 37.0902, lng: -95.7129, name: 'United States' },
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

export default function StatisticsMapLeaflet({ selectedGeoId, onCountryClick }: Props) {
  return (
    <div className="w-full h-[360px] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        minZoom={2}
        maxZoom={6}
        maxBounds={[[ -85, -180 ], [ 85, 180 ]]}
        maxBoundsViscosity={1}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo selectedGeoId={selectedGeoId} />

        {Object.entries(COORDS).map(([geoId, c]) => (
          <CircleMarker
            key={geoId}
            center={[c.lat, c.lng]}
            radius={selectedGeoId === geoId ? 8 : 6}
            pathOptions={{ color: selectedGeoId === geoId ? '#FF5656' : '#FFA239', fillColor: selectedGeoId === geoId ? '#FF5656' : '#FFA239', fillOpacity: 1 }}
            eventHandlers={{ click: () => onCountryClick(geoId) }}
          />
        ))}
      </MapContainer>
    </div>
  )
}