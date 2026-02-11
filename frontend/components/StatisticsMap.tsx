"use client"

import React, { useEffect, useState } from 'react'
//Reymes Olide 1/31/26 - Static SVG map component
type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
}

// approximate positions on the map svg (percent x/y)
const POS: Record<string, { x: number; y: number }> = {
  '50': { x: 82, y: 32 }, // BGD (Bangladesh) - Asia
  '76': { x: 25, y: 56 }, // BRA (Brazil) - South America
  '231': { x: 60, y: 36 }, // ETH (Ethiopia) - East Africa
  '356': { x: 64, y: 32 }, // IND (India)
  '404': { x: 58, y: 44 }, // KEN (Kenya)
  '484': { x: 16, y: 44 }, // MEX (Mexico)
  '566': { x: 44, y: 48 }, // NGA (Nigeria)
  '840': { x: 10, y: 30 }, // USA (approx center of USA)
}

export default function StatisticsMap({ selectedGeoId, onCountryClick }: Props) {
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

  return (
    <div 
      className="w-full h-[360px] rounded-lg border p-4"
      style={{
        background: isDark 
          ? 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.05), rgba(254, 238, 145, 0.05))'
          : 'linear-gradient(to bottom right, rgba(140, 228, 255, 0.05), rgba(254, 238, 145, 0.05))',
        borderColor: 'var(--color-gray-light)'
      }}
    >
      <svg viewBox="0 0 100 60" className="w-full h-full">
        {/* Simple stylized ground and ocean */}
        <rect x="0" y="0" width="100" height="60" fill={isDark ? '#1a1a1a' : '#e6f7ff'} />
        {/* land patches (stylized shapes) */}
        <g fill={isDark ? '#2a2a2a' : '#f4f4f4'} opacity={0.9}>
          <ellipse cx="20" cy="25" rx="18" ry="8" fill={isDark ? '#2a2a2a' : '#f7f3ea'} />
          <ellipse cx="45" cy="30" rx="24" ry="10" fill={isDark ? '#2e2e2e' : '#fff6ec'} />
          <ellipse cx="70" cy="26" rx="20" ry="9" fill={isDark ? '#323232' : '#fff8ef'} />
          <ellipse cx="30" cy="44" rx="20" ry="8" fill={isDark ? '#2c2c2c' : '#fff7ee'} />
        </g>

        {/* Country hotspots */}
        {Object.entries(POS).map(([geoId, pos]) => {
          const isSelected = String(selectedGeoId) === geoId
          return (
            <g key={geoId} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-pointer" onClick={() => onCountryClick(geoId)}>
              <circle r={isSelected ? 2.5 : 2} fill={isSelected ? '#FF5656' : '#FFA239'} stroke={isDark ? '#333' : '#fff'} strokeWidth={0.3} />
              <text x={3} y={1.5} fontSize={3} fill={isDark ? '#e0e0e0' : '#333'} style={{ fontWeight: 600 }}>{geoId}</text>
            </g>
          )
        })}

        {/* legend */}
        <g transform="translate(2,2)">
          <rect x="0" y="0" width="28" height="8" fill={isDark ? '#2a2a2a' : '#fff'} stroke={isDark ? '#444' : '#eee'} rx={2} />
          <circle cx="2.5" cy="4" r={1.5} fill="#FF5656" />
          <text x="6" y="5" fontSize={2.5} fill={isDark ? '#e0e0e0' : '#333'}>Selected country</text>
        </g>
      </svg>
    </div>
  )
}