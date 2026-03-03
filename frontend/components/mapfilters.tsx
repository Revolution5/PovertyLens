"use client"

import React from "react"

// Added by Reymes 3/2/26 - toggle component to switch between national and international poverty rates

export type RateType = "national" | "international"

type Props = {
  value: RateType
  onChange: (rateType: RateType) => void
}

export default function MapFilters({ value, onChange }: Props) {
  const isDark =
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border" style={{
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgb(249, 250, 251)",
      borderColor: "var(--color-gray-light)"
    }}>
      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
        Rate Type:
      </span>
      
      <div className="flex gap-2">
        <button
          onClick={() => onChange("national")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            value === "national"
              ? "shadow-sm"
              : "opacity-60 hover:opacity-100"
          }`}
          style={{
            backgroundColor:
              value === "national"
                ? "var(--gradient-cyan-yellow)"
                : "transparent",
            color: value === "national" ? "#000" : "var(--foreground)",
            border:
              value === "national"
                ? `1px solid transparent`
                : `1px solid var(--color-gray-light)`,
          }}
        >
          National
        </button>

        <button
          onClick={() => onChange("international")}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            value === "international"
              ? "shadow-sm"
              : "opacity-60 hover:opacity-100"
          }`}
          style={{
            backgroundColor:
              value === "international"
                ? "var(--gradient-cyan-yellow)"
                : "transparent",
            color: value === "international" ? "#000" : "var(--foreground)",
            border:
              value === "international"
                ? `1px solid transparent`
                : `1px solid var(--color-gray-light)`,
          }}
        >
          International
        </button>
      </div>

      <div className="text-xs ml-2" style={{ color: "var(--color-gray)" }}>
        {value === "national"
          ? "Displays national poverty lines for developed countries"
          : "Displays World Bank $2.15/day international line"}
      </div>
    </div>
  )
}
