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
//Reymes Olide 1/31/26 map components
type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
  mapRows: MapRow[]
  //end of initial props - added by Reymes Olide 1/31/26
  showMarkers?: boolean; // Added by Christella, 02/03/2026
  rateType?: "national" | "international"; // Added by Reymes 3/2/26 - toggle between national and international rates
  showSchools?: boolean; // Added by Damon 3/19/26 - show school facility pins
  showHospitals?: boolean; // Added by Damon 3/19/26 - show hospital facility pins
}
//Initial add Reymes Olide 1/31/26 - Dynamic import wrapper for Leaflet map component
export default function StatisticsMapClient({ selectedGeoId, onCountryClick, mapRows, showMarkers = true, rateType = "national", showSchools = false, showHospitals = false }: Props) {
  const [Component, setComponent] = useState<any>(null)
  // Added by Marisol for Dark Mode Start - 2/8/2026
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
  // Added by Marisol for Dark Mode End - 2/8/2026

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
        <Component selectedGeoId={selectedGeoId} onCountryClick={onCountryClick} mapRows={mapRows} showMarkers={showMarkers} rateType={rateType} showSchools={showSchools} showHospitals={showHospitals}/>
      ) : (
        <div 
          className="w-full h-[360px] rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgb(249, 250, 251)', // Changed by Marisol for Dark Mode End - 2/8/2026
            color: 'var(--color-gray)'
          }}
        >
          Loading map...
        </div>
      )}
    </div>
  )
}
//End of initial addition by Reymes Olide, 1/31/26