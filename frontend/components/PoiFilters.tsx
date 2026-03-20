// Created by Damon 3/19/2026 - POI (Points of Interest) filter toggles for schools and hospitals
"use client"

import React, { useEffect, useState } from "react"


export type PoiFilterType = "schools" | "hospitals"

type Props = {
  showSchools: boolean
  onShowSchoolsChange: (value: boolean) => void
  showHospitals: boolean
  onShowHospitalsChange: (value: boolean) => void
  hasSelection?: boolean // true if a country is currently selected
}

export default function PoiFilters({
  showSchools,
  onShowSchoolsChange,
  showHospitals,
  onShowHospitalsChange,
  hasSelection = false,
}: Props) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3 rounded-lg border"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgb(249,250,251)",
        borderColor: "var(--color-gray-light)",
      }}
    >
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
        Points of Interest:
      </span>

      {/* Toggle pills for Schools and Hospitals */}
      <div className="flex flex-wrap gap-2">
        {/* Schools toggle */}
        <button
          onClick={() => onShowSchoolsChange(!showSchools)}
          disabled={!hasSelection}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            showSchools && hasSelection
              ? {
                  backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#ffffff",
                  color: "var(--foreground)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  fontWeight: 600,
                }
              : {
                  background: "transparent",
                  color: hasSelection ? "var(--color-gray)" : "var(--color-gray-light)",
                }
          }
        >
          Schools
        </button>

        {/* Hospitals toggle */}
        <button
          onClick={() => onShowHospitalsChange(!showHospitals)}
          disabled={!hasSelection}
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            showHospitals && hasSelection
              ? {
                  backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#ffffff",
                  color: "var(--foreground)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  fontWeight: 600,
                }
              : {
                  background: "transparent",
                  color: hasSelection ? "var(--color-gray)" : "var(--color-gray-light)",
                }
          }
        >
          Hospitals
        </button>
      </div>

      {/* Hint text when no country is selected */}
      {!hasSelection && (
        <div
          className="text-xs italic"
          style={{ color: "var(--color-gray-light)" }}
        >
          (select a country to activate)
        </div>
      )}
    </div>
  )
}
