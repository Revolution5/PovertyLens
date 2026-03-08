"use client"

import React, { useEffect, useState } from "react"

// Added by Reymes 3/2/26 - toggle component to switch between national and international poverty rates

export type RateType = "national" | "international"

type Props = {
  value: RateType
  onChange: (rateType: RateType) => void
}

export default function MapFilters({ value, onChange }: Props) {
  // Reymes 3/3/26 - fixed isDark to be reactive via useState/useEffect instead of a static read
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return (
    // Reymes 3/3/26 - updated container to neutral styling (removed cyan tint) for better readability
    <div
      className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg border"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgb(249,250,251)",
        borderColor: "var(--color-gray-light)",
      }}
    >
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
        Rate Type:
      </span>

      {/* Reymes 3/3/26 - toggle pill track uses neutral gray; active tab is white/dark-alpha instead of gradient */}
      {/* Toggle pills */}
      <div
        className="flex rounded-lg p-0.5"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
        {(["national", "international"] as RateType[]).map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150"
            style={
              value === type
                ? {
                    backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#ffffff",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    fontWeight: 600,
                  }
                : {
                    background: "transparent",
                    color: "var(--color-gray)",
                  }
            }
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Descriptor */}
      <span className="text-xs" style={{ color: "var(--color-gray)" }}>
        {value === "national"
          ? "National poverty lines defined by each country"
          : "World Bank $2.15/day international line"}
      </span>
    </div>
  )
}
