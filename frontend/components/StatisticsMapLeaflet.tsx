"use client"

import React, { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import * as GeoJSON from "geojson"
import "leaflet/dist/leaflet.css"
// Added by Damon 3/19/26 - import marker clustering for facility pins
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
// Added by Reymes 3/2/26 - import rate data files for filter support
import { NATIONAL_POVERTY_RATES } from "../data/nationalRates"
import { normalizeRate, INTERNATIONAL_FALLBACK_RATES } from "../data/internationalRates"
// Added by Damon 3/19/26 - import facility data and helpers for school/hospital pins
import { FACILITIES, getSchoolsByCountry, getHospitalsByCountry } from "../data/facilityData"
//Reymes Olide 1/31/26 - Leaflet map component with country coloring
//Reymes Olide 2/10/26 - Added poverty rate coloring, names on hover, and poverty rates on hover.
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
// End of addition by Christella, 02/03/2026
// Function to get color based on poverty rate 2/10/26 - Reymes Olide
// Updated 2/20/26 - Improved color visibility - Reymes
function getPovertyColor(povertyRate: number | null | undefined): string {
  if (povertyRate === null || povertyRate === undefined) return "#E8E8E8" // Very light gray - untracked country
  if (povertyRate > 40) return "#8B0000" // Dark red - very high poverty
  if (povertyRate > 30) return "#DC143C" // Crimson - high poverty
  if (povertyRate > 20) return "#FF6347" // Tomato - moderate poverty
  if (povertyRate > 10) return "#FFA500" // Orange - low-moderate poverty
  if (povertyRate > 5) return "#FFD700" // Gold - low poverty
  return "#90EE90" // Light green - very low poverty
}

// START Added by Damon 3/24/26
  onSelectedFacilityDistanceChange?: (distanceKm: number | null) => void 
function getDistanceColor(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined) return "#E8E8E8"
  if (distanceKm > 1200) return "#8B0000"
  if (distanceKm > 900) return "#DC143C"
  if (distanceKm > 600) return "#FF6347"
  if (distanceKm > 300) return "#FFA500"
  if (distanceKm > 150) return "#FFD700"
  return "#90EE90"
}

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const startLat = toRadians(lat1)
  const endLat = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}
// END Added by Damon 3/24/26

type Props = {
  selectedGeoId: string | null
  onCountryClick: (geoId: string) => void
  mapRows: MapRow[]
  showMarkers?: boolean
  rateType?: "national" | "international"; // Added by Reymes 3/2/26
  showSchools?: boolean; // Added by Damon 3/19/26 - show school pins
  showHospitals?: boolean; // Added by Damon 3/19/26 - show hospital pins
  onSelectedFacilityDistanceChange?: (distanceKm: number | null) => void // Added by Copilot 3/24/26 - sync right panel metric with map overlay
}

// National rates now imported from data/nationalRates.ts - Reymes 3/2/26
// Mapping of geoId to country coordinates and names
//updated by Reymes 2/13/26
// Updated 2/20/26 - Added more countries Reymes
// Organized by continent - 2/20/26 Reymes
const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  // AFRICA
  "12": { lat: 28.0339, lng: 1.6596, name: "Algeria" },
  "24": { lat: -11.2027, lng: 17.8739, name: "Angola" },
  "204": { lat: 9.3077, lng: 2.3158, name: "Benin" },
  "72": { lat: -22.3285, lng: 24.6849, name: "Botswana" },
  "854": { lat: 12.2383, lng: -1.5616, name: "Burkina Faso" },
  "108": { lat: -3.3731, lng: 29.9189, name: "Burundi" },
  "120": { lat: 7.3697, lng: 12.3547, name: "Cameroon" },
  "132": { lat: 16.5388, lng: -23.0418, name: "Cabo Verde" }, // Added by Marisol Morales - 3/2/2026
  "140": { lat: 6.6111, lng: 20.9394, name: "Central African Republic" },
  "148": { lat: 15.4542, lng: 18.7322, name: "Chad" },
  "174": { lat: -11.6455, lng: 43.3333, name: "Comoros" }, // Added by Marisol Morales - 3/2/2026
  "178": { lat: -0.2280, lng: 15.8277, name: "Congo" },
  "180": { lat: -4.0383, lng: 21.7587, name: "Democratic Republic of the Congo" },
  "262": { lat: 11.8251, lng: 42.5903, name: "Djibouti" }, // Added by Marisol Morales - 3/2/2026
  "384": { lat: 7.5400, lng: -5.5471, name: "Côte d'Ivoire" },
  "818": { lat: 26.8206, lng: 30.8025, name: "Egypt" },
  "226": { lat: 1.6508, lng: 10.2679, name: "Equatorial Guinea" }, // Added by Marisol Morales - 3/2/2026
  "232": { lat: 15.1794, lng: 39.7823, name: "Eritrea" }, // Added by Marisol Morales - 3/2/2026
  "231": { lat: 9.145, lng: 40.4897, name: "Ethiopia" },
  "748": { lat: -26.5225, lng: 31.4659, name: "Eswatini" },
  "266": { lat: -0.8037, lng: 11.6094, name: "Gabon" },
  "270": { lat: 13.4432, lng: -15.3101, name: "Gambia" },
  "288": { lat: 7.9465, lng: -1.0232, name: "Ghana" },
  "324": { lat: 9.9456, lng: -9.6966, name: "Guinea" },
  "624": { lat: 11.8037, lng: -15.1804, name: "Guinea-Bissau" }, // Added by Marisol Morales - 3/2/2026
  "404": { lat: -0.0236, lng: 37.9062, name: "Kenya" },
  "426": { lat: -29.6100, lng: 28.2336, name: "Lesotho" },
  "430": { lat: 6.4281, lng: -9.4295, name: "Liberia" },
  "434": { lat: 26.3351, lng: 17.2283, name: "Libya" }, // Added by Marisol Morales - 3/2/2026
  "450": { lat: -18.7669, lng: 46.8691, name: "Madagascar" },
  "454": { lat: -13.2543, lng: 34.3015, name: "Malawi" },
  "466": { lat: 17.5707, lng: -3.9962, name: "Mali" },
  "478": { lat: 21.0079, lng: -10.9408, name: "Mauritania" },
  "480": { lat: -20.3484, lng: 57.5522, name: "Mauritius" }, // Added by Marisol Morales - 3/2/2026
  "504": { lat: 31.7917, lng: -7.0926, name: "Morocco" },
  "508": { lat: -18.6657, lng: 35.5296, name: "Mozambique" },
  "516": { lat: -22.9576, lng: 18.4904, name: "Namibia" },
  "562": { lat: 17.6078, lng: 8.0817, name: "Niger" },
  "566": { lat: 9.082, lng: 8.6753, name: "Nigeria" },
  "646": { lat: -1.9403, lng: 29.8739, name: "Rwanda" },
  "678": { lat: 0.1864, lng: 6.6131, name: "São Tomé and Príncipe" }, // Added by Marisol Morales - 3/2/2026
  "686": { lat: 14.4974, lng: -14.4524, name: "Senegal" },
  "694": { lat: 8.4606, lng: -11.7799, name: "Sierra Leone" },
  "706": { lat: 5.1521, lng: 46.1996, name: "Somalia" }, // Added by Marisol Morales - 3/2/2026
  "710": { lat: -30.5595, lng: 22.9375, name: "South Africa" },
  "728": { lat: 6.8770, lng: 31.3070, name: "South Sudan" }, // Added by Marisol Morales - 3/2/2026
  "729": { lat: 12.8628, lng: 30.2176, name: "Sudan" },
  "834": { lat: -6.3690, lng: 34.8888, name: "Tanzania" }, // United Republic of Tanzania
  "768": { lat: 8.6195, lng: 0.8248, name: "Togo" },
  "788": { lat: 33.8869, lng: 9.5375, name: "Tunisia" },
  "800": { lat: 1.3733, lng: 32.2903, name: "Uganda" },
  "894": { lat: -13.1339, lng: 27.8493, name: "Zambia" },
  "690": { lat: -4.6796,  lng: 55.4920,   name: "Seychelles" },
  "716": { lat: -19.0154, lng: 29.1549,   name: "Zimbabwe" },
  "732": { lat: 24.2155,  lng: -12.8858,  name: "Western Sahara" }, // Added by Reymes 3/7/26
  "SOL": { lat: 9.6000,   lng: 46.2000,   name: "Somaliland" },     // Added by Reymes 3/7/26

  // ASIA
  "4": { lat: 33.9391, lng: 67.7100, name: "Afghanistan" }, // Added by Marisol Morales - 3/2/2026
  "51": { lat: 40.0691, lng: 45.0382, name: "Armenia" }, // Added by Marisol Morales - 3/2/2026
  "31": { lat: 40.1431, lng: 47.5769, name: "Azerbaijan" }, // Added by Marisol Morales - 3/2/2026
  "50": { lat: 23.685, lng: 90.3563, name: "Bangladesh" },
  "64": { lat: 27.5142, lng: 90.4336, name: "Bhutan" }, // Added by Marisol Morales - 3/2/2026
  "96": { lat: 4.5353, lng: 114.7277, name: "Brunei" }, // Added by Marisol Morales - 3/2/2026
  "116": { lat: 12.5657, lng: 104.9910, name: "Cambodia" }, // Added by Marisol Morales - 3/2/2026
  "156": { lat: 35.8617, lng: 104.1954, name: "China" }, // Added by Marisol Morales - 3/2/2026
  "268": { lat: 42.3154, lng: 43.3569, name: "Georgia" }, // Added by Marisol Morales - 3/2/2026
  "356": { lat: 20.5937, lng: 78.9629, name: "India" },
  "360": { lat: -0.7893, lng: 113.9213, name: "Indonesia" }, // Added by Marisol Morales - 3/2/2026
  "364": { lat: 32.4279, lng: 53.6880, name: "Iran" }, // Added by Marisol Morales - 3/2/2026
  "368": { lat: 33.2232, lng: 43.6793, name: "Iraq" }, // Added by Marisol Morales - 3/2/2026
  "376": { lat: 31.0461, lng: 34.8516, name: "Israel" }, // Added by Marisol Morales - 3/2/2026
  "392": { lat: 36.2048, lng: 138.2529, name: "Japan" },
  "400": { lat: 30.5852, lng: 36.2384, name: "Jordan" }, // Added by Marisol Morales - 3/2/2026
  "398": { lat: 48.0196, lng: 66.9237, name: "Kazakhstan" }, // Added by Marisol Morales - 3/2/2026
  "408": { lat: 40.3399, lng: 127.5101, name: "North Korea" }, // Added by Marisol Morales - 3/2/2026
  "410": { lat: 35.9078, lng: 127.7669, name: "South Korea" },
  "414": { lat: 29.3117, lng: 47.4818, name: "Kuwait" }, // Added by Marisol Morales - 3/2/2026
  "417": { lat: 41.2044, lng: 74.7661, name: "Kyrgyzstan" }, // Added by Marisol Morales - 3/2/2026
  "418": { lat: 19.8563, lng: 102.4955, name: "Laos" }, // Added by Marisol Morales - 3/2/2026
  "422": { lat: 33.8547, lng: 35.8623, name: "Lebanon" }, // Added by Marisol Morales - 3/2/2026
  "458": { lat: 4.2105, lng: 101.9758, name: "Malaysia" }, // Added by Marisol Morales - 3/2/2026
  "462": { lat: 3.2028, lng: 73.2207, name: "Maldives" }, // Added by Marisol Morales - 3/2/2026
  "496": { lat: 46.8625, lng: 103.8467, name: "Mongolia" }, // Added by Marisol Morales - 3/2/2026
  "104": { lat: 21.9162, lng: 95.9560, name: "Myanmar" }, // Added by Marisol Morales - 3/2/2026
  "524": { lat: 28.3949, lng: 84.1240, name: "Nepal" }, // Added by Marisol Morales - 3/2/2026
  "512": { lat: 21.4735, lng: 55.9754, name: "Oman" }, // Added by Marisol Morales - 3/2/2026
  "586": { lat: 30.3753, lng: 69.3451, name: "Pakistan" }, // Added by Marisol Morales - 3/2/2026
  "275": { lat: 31.9522, lng: 35.2332, name: "Palestine" }, // Added by Marisol Morales - 3/2/2026
  "608": { lat: 12.8797, lng: 121.7740, name: "Philippines" }, // Added by Marisol Morales - 3/2/2026
  "634": { lat: 25.3548, lng: 51.1839, name: "Qatar" }, // Added by Marisol Morales - 3/2/2026
  "682": { lat: 23.8859, lng: 45.0792, name: "Saudi Arabia" }, // Added by Marisol Morales - 3/2/2026
  "702": { lat: 1.3521, lng: 103.8198, name: "Singapore" }, // Added by Marisol Morales - 3/2/2026
  "144": { lat: 7.8731, lng: 80.7718, name: "Sri Lanka" }, // Added by Marisol Morales - 3/2/2026
  "760": { lat: 34.8021, lng: 38.9968, name: "Syria" }, // Added by Marisol Morales - 3/2/2026
  "762": { lat: 38.8610, lng: 71.2761, name: "Tajikistan" }, // Added by Marisol Morales - 3/2/2026
  "764": { lat: 15.8700, lng: 100.9925, name: "Thailand" }, // Added by Marisol Morales - 3/2/2026
  "626": { lat: -8.8742, lng: 125.7275, name: "Timor-Leste" }, // Added by Marisol Morales - 3/2/2026
  "792": { lat: 38.9637, lng: 35.2433, name: "Turkey" }, // Added by Marisol Morales - 3/2/2026
  "795": { lat: 38.9697, lng: 59.5563, name: "Turkmenistan" }, // Added by Marisol Morales - 3/2/2026
  "784": { lat: 23.4241, lng: 53.8478, name: "United Arab Emirates" }, // Added by Marisol Morales - 3/2/2026
  "860": { lat: 41.3775, lng: 64.5853, name: "Uzbekistan" }, // Added by Marisol Morales - 3/2/2026
  "704": { lat: 14.0583, lng: 108.2772, name: "Vietnam" }, // Added by Marisol Morales - 3/2/2026
  "48":  { lat: 25.9304,  lng: 50.6378,   name: "Bahrain" },
  "158": { lat: 23.6978,  lng: 120.9605,  name: "Taiwan" },
  "887": { lat: 15.5527,  lng: 48.5164,   name: "Yemen" }, // Added by Marisol Morales - 3/2/2026

  // EUROPE
  "8": { lat: 41.1533, lng: 20.1683, name: "Albania" }, // Added by Marisol Morales - 3/2/2026
  "20": { lat: 42.5063, lng: 1.5218, name: "Andorra" }, // Added by Marisol Morales - 3/2/2026
  "40": { lat: 47.5162, lng: 14.5501, name: "Austria" },
  "112": { lat: 53.7098, lng: 27.9534, name: "Belarus" }, // Added by Marisol Morales - 3/2/2026
  "56": { lat: 50.5039, lng: 4.4699, name: "Belgium" },
  "70": { lat: 43.9159, lng: 17.6791, name: "Bosnia and Herzegovina" }, // Added by Marisol Morales - 3/2/2026
  "100": { lat: 42.7339, lng: 25.4858, name: "Bulgaria" }, // Added by Marisol Morales - 3/2/2026
  "191": { lat: 45.1000, lng: 15.2000, name: "Croatia" }, // Added by Marisol Morales - 3/2/2026
  "196": { lat: 35.1264, lng: 33.4299, name: "Cyprus" }, // Added by Marisol Morales - 3/2/2026
  "203": { lat: 49.8175, lng: 15.4730, name: "Czechia" }, // Added by Marisol Morales - 3/2/2026
  "208": { lat: 56.2639, lng: 9.5018, name: "Denmark" }, // Added by Marisol Morales - 3/2/2026
  "233": { lat: 58.5953, lng: 25.0136, name: "Estonia" }, // Added by Marisol Morales - 3/2/2026
  "246": { lat: 61.9241, lng: 25.7482, name: "Finland" }, // Added by Marisol Morales - 3/2/2026
  "250": { lat: 46.2276, lng: 2.2137, name: "France" },
  "276": { lat: 51.1657, lng: 10.4515, name: "Germany" },
  "300": { lat: 39.0742, lng: 21.8243, name: "Greece" }, // Added by Marisol Morales - 3/2/2026
  "348": { lat: 47.1625, lng: 19.5033, name: "Hungary" }, // Added by Marisol Morales - 3/2/2026
  "352": { lat: 64.9631, lng: -19.0208, name: "Iceland" }, // Added by Marisol Morales - 3/2/2026
  "372": { lat: 53.1424, lng: -7.6921, name: "Ireland" }, // Added by Marisol Morales - 3/2/2026
  "380": { lat: 41.8719, lng: 12.5674, name: "Italy" },
  "428": { lat: 56.8796, lng: 24.6032, name: "Latvia" }, // Added by Marisol Morales - 3/2/2026
  "438": { lat: 47.1660, lng: 9.5554, name: "Liechtenstein" }, // Added by Marisol Morales - 3/2/2026
  "440": { lat: 55.1694, lng: 23.8813, name: "Lithuania" }, // Added by Marisol Morales - 3/2/2026
  "442": { lat: 49.8153, lng: 6.1296, name: "Luxembourg" }, // Added by Marisol Morales - 3/2/2026
  "807": { lat: 41.6086, lng: 21.7453, name: "North Macedonia" }, // Added by Marisol Morales - 3/2/2026
  "470": { lat: 35.9375, lng: 14.3754, name: "Malta" }, // Added by Marisol Morales - 3/2/2026
  "498": { lat: 47.4116, lng: 28.3699, name: "Moldova" }, // Added by Marisol Morales - 3/2/2026
  "492": { lat: 43.7384, lng: 7.4246, name: "Monaco" }, // Added by Marisol Morales - 3/2/2026
  "499": { lat: 42.7087, lng: 19.3744, name: "Montenegro" }, // Added by Marisol Morales - 3/2/2026
  "528": { lat: 52.1326, lng: 5.2913, name: "Netherlands" },
  "578": { lat: 60.4720, lng: 8.4689, name: "Norway" },
  "616": { lat: 51.9194, lng: 19.1451, name: "Poland" }, // Added by Marisol Morales - 3/2/2026
  "620": { lat: 39.3999, lng: -8.2245, name: "Portugal" }, // Added by Marisol Morales - 3/2/2026
  "642": { lat: 45.9432, lng: 24.9668, name: "Romania" }, // Added by Marisol Morales - 3/2/2026
  "643": { lat: 61.5240, lng: 105.3188, name: "Russia" }, // Added by Marisol Morales - 3/2/2026
  "688": { lat: 44.0165, lng: 21.0059, name: "Serbia" }, // Added by Marisol Morales - 3/2/2026
  "703": { lat: 48.6690, lng: 19.6990, name: "Slovakia" }, // Added by Marisol Morales - 3/2/2026
  "705": { lat: 46.1512, lng: 14.9955, name: "Slovenia" }, // Added by Marisol Morales - 3/2/2026
  "724": { lat: 40.4637, lng: -3.7492, name: "Spain" },
  "752": { lat: 60.1282, lng: 18.6435, name: "Sweden" },
  "756": { lat: 46.8182, lng: 8.2275, name: "Switzerland" },
  "804": { lat: 48.3794, lng: 31.1656, name: "Ukraine" }, // Added by Marisol Morales - 3/2/2026
  "674": { lat: 43.9336,  lng: 12.4578,   name: "San Marino" },
  "826": { lat: 55.3781,  lng: -3.4360,   name: "United Kingdom" },
  "XKX": { lat: 42.6026,  lng: 20.9030,   name: "Kosovo" },
  "304": { lat: 71.7069,  lng: -42.6043,  name: "Greenland" },      // Added by Reymes 3/7/26
  "336": { lat: 41.9029,  lng: 12.4534,   name: "Vatican" },        // Added by Reymes 3/7/26
  "NCY": { lat: 35.2517,  lng: 33.4299,   name: "Northern Cyprus" },// Added by Reymes 3/7/26

  // NORTH AMERICA & CARIBBEAN
  "44": { lat: 25.0343, lng: -77.3963, name: "Bahamas" }, // Added by Marisol Morales - 3/2/2026
  "84": { lat: 17.1899, lng: -88.4976, name: "Belize" }, // Added by Marisol Morales - 3/2/2026
  "124": { lat: 56.1304, lng: -106.3468, name: "Canada" },
  "188": { lat: 9.7489, lng: -83.7534, name: "Costa Rica" }, // Added by Marisol Morales - 3/2/2026
  "192": { lat: 21.5218, lng: -77.7812, name: "Cuba" }, // Added by Marisol Morales - 3/2/2026
  "214": { lat: 18.7357, lng: -70.1627, name: "Dominican Republic" }, // Added by Marisol Morales - 3/2/2026
  "222": { lat: 13.7942, lng: -88.8965, name: "El Salvador" }, // Added by Marisol Morales - 3/2/2026
  "320": { lat: 15.7835, lng: -90.2308, name: "Guatemala" }, // Added by Marisol Morales - 3/2/2026
  "332": { lat: 18.9712, lng: -72.2852, name: "Haiti" }, // Added by Marisol Morales - 3/2/2026
  "340": { lat: 15.2000, lng: -86.2419, name: "Honduras" }, // Added by Marisol Morales - 3/2/2026
  "388": { lat: 18.1096, lng: -77.2975, name: "Jamaica" }, // Added by Marisol Morales - 3/2/2026
  "484": { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  "558": { lat: 12.8654, lng: -85.2072, name: "Nicaragua" }, // Added by Marisol Morales - 3/2/2026
  "591": { lat: 8.5380, lng: -80.7821, name: "Panama" }, // Added by Marisol Morales - 3/2/2026
  "630": { lat: 18.2208, lng: -66.5901, name: "Puerto Rico" }, // Added by Marisol Morales - 3/2/2026
  "780": { lat: 10.6918, lng: -61.2225, name: "Trinidad and Tobago" }, // Added by Marisol Morales - 3/2/2026
  "28":  { lat: 17.0608,  lng: -61.7964,  name: "Antigua and Barbuda" },
  "52":  { lat: 13.1939,  lng: -59.5432,  name: "Barbados" },
  "212": { lat: 15.4150,  lng: -61.3710,  name: "Dominica" },
  "308": { lat: 12.1165,  lng: -61.6790,  name: "Grenada" },
  "659": { lat: 17.3578,  lng: -62.7830,  name: "Saint Kitts and Nevis" },
  "662": { lat: 13.9094,  lng: -60.9789,  name: "Saint Lucia" },
  "670": { lat: 12.9843,  lng: -61.2872,  name: "Saint Vincent and the Grenadines" },
  "840": { lat: 37.0902,  lng: -95.7129,  name: "United States" },

  // SOUTH AMERICA
  "32": { lat: -38.4161, lng: -63.6167, name: "Argentina" }, // Added by Marisol Morales - 3/2/2026
  "68": { lat: -16.2902, lng: -63.5887, name: "Bolivia" }, // Added by Marisol Morales - 3/2/2026
  "76": { lat: -14.235, lng: -51.9253, name: "Brazil" },
  "152": { lat: -35.6751, lng: -71.5430, name: "Chile" }, // Added by Marisol Morales - 3/2/2026
  "170": { lat: 4.5709, lng: -74.2973, name: "Colombia" }, // Added by Marisol Morales - 3/2/2026
  "218": { lat: -1.8312, lng: -78.1834, name: "Ecuador" }, // Added by Marisol Morales - 3/2/2026
  "328": { lat: 4.8604, lng: -58.9302, name: "Guyana" }, // Added by Marisol Morales - 3/2/2026
  "600": { lat: -23.4425, lng: -58.4438, name: "Paraguay" }, // Added by Marisol Morales - 3/2/2026
  "604": { lat: -9.1900, lng: -75.0152, name: "Peru" }, // Added by Marisol Morales - 3/2/2026
  "740": { lat: 3.9193, lng: -56.0278, name: "Suriname" }, // Added by Marisol Morales - 3/2/2026
  "858": { lat: -32.5228, lng: -55.7658, name: "Uruguay" }, // Added by Marisol Morales - 3/2/2026
  "862": { lat: 6.4238, lng: -66.5897, name: "Venezuela" }, // Added by Marisol Morales - 3/2/2026

  // OCEANIA
  "36": { lat: -25.2744, lng: 133.7751, name: "Australia" },
  "242": { lat: -17.7134, lng: 178.0650, name: "Fiji" }, // Added by Marisol Morales - 3/2/2026
  "598": { lat: -6.3150, lng: 143.9555, name: "Papua New Guinea" }, // Added by Marisol Morales - 3/2/2026
  "090": { lat: -9.6457, lng: 160.1562, name: "Solomon Islands" }, // Added by Marisol Morales - 3/2/2026
  "548": { lat: -15.3767, lng: 166.9592, name: "Vanuatu" }, // Added by Marisol Morales - 3/2/2026
  "296": { lat: 1.8700,   lng: 175.5000,  name: "Kiribati" },
  "520": { lat: -0.5228,  lng: 166.9315,  name: "Nauru" },
  "554": { lat: -40.9006, lng: 174.8860,  name: "New Zealand" }, // Added by Marisol Morales - 3/2/2026
  "583": { lat: 7.4256,   lng: 150.5508,  name: "Micronesia" },
  "584": { lat: 7.1315,   lng: 171.1845,  name: "Marshall Islands" },
  "585": { lat: 7.5150,   lng: 134.5825,  name: "Palau" },
  "776": { lat: -21.1790, lng: -175.1982, name: "Tonga" },
  "798": { lat: -7.1095,  lng: 177.6493,  name: "Tuvalu" },
  "882": { lat: -13.7590, lng: -172.1046, name: "Samoa" },
}

// Mapping of country names to ISO3 codes and GeoJSON country names 
//Updated countires 2/13/26
// Updated 2/20/26 - Added more developed countries Reymes
// Organized by continent Reymes
const COUNTRY_CODE_MAP: Record<string, { iso3: string; name: string; geojsonName: string }> = {
  // AFRICA
  "12": { iso3: "DZA", name: "Algeria", geojsonName: "Algeria" },
  "24": { iso3: "AGO", name: "Angola", geojsonName: "Angola" },
  "204": { iso3: "BEN", name: "Benin", geojsonName: "Benin" },
  "72": { iso3: "BWA", name: "Botswana", geojsonName: "Botswana" },
  "854": { iso3: "BFA", name: "Burkina Faso", geojsonName: "Burkina Faso" },
  "108": { iso3: "BDI", name: "Burundi", geojsonName: "Burundi" },
  "120": { iso3: "CMR", name: "Cameroon", geojsonName: "Cameroon" },
  "132": { iso3: "CPV", name: "Cabo Verde", geojsonName: "Cabo Verde" }, // Added by Marisol Morales - 3/2/2026
  "140": { iso3: "CAF", name: "Central African Republic", geojsonName: "Central African Republic" },
  "148": { iso3: "TCD", name: "Chad", geojsonName: "Chad" },
  "174": { iso3: "COM", name: "Comoros", geojsonName: "Comoros" }, // Added by Marisol Morales - 3/2/2026
  "178": { iso3: "COG", name: "Congo", geojsonName: "Republic of the Congo" },
  "180": { iso3: "COD", name: "Democratic Republic of the Congo", geojsonName: "Democratic Republic of the Congo" },
  "262": { iso3: "DJI", name: "Djibouti", geojsonName: "Djibouti" }, // Added by Marisol Morales - 3/2/2026
  "384": { iso3: "CIV", name: "Côte d'Ivoire", geojsonName: "Ivory Coast" },
  "818": { iso3: "EGY", name: "Egypt", geojsonName: "Egypt" },
  "226": { iso3: "GNQ", name: "Equatorial Guinea", geojsonName: "Equatorial Guinea" }, // Added by Marisol Morales - 3/2/2026
  "232": { iso3: "ERI", name: "Eritrea", geojsonName: "Eritrea" }, // Added by Marisol Morales - 3/2/2026
  "231": { iso3: "ETH", name: "Ethiopia", geojsonName: "Ethiopia" },
  "748": { iso3: "SWZ", name: "Eswatini", geojsonName: "eSwatini" },
  "266": { iso3: "GAB", name: "Gabon", geojsonName: "Gabon" },
  "270": { iso3: "GMB", name: "Gambia", geojsonName: "Gambia" },
  "288": { iso3: "GHA", name: "Ghana", geojsonName: "Ghana" },
  "324": { iso3: "GIN", name: "Guinea", geojsonName: "Guinea" },
  "624": { iso3: "GNB", name: "Guinea-Bissau", geojsonName: "Guinea-Bissau" }, // Added by Marisol Morales - 3/2/2026
  "404": { iso3: "KEN", name: "Kenya", geojsonName: "Kenya" },
  "426": { iso3: "LSO", name: "Lesotho", geojsonName: "Lesotho" },
  "430": { iso3: "LBR", name: "Liberia", geojsonName: "Liberia" },
  "434": { iso3: "LBY", name: "Libya", geojsonName: "Libya" }, // Added by Marisol Morales - 3/2/2026
  "450": { iso3: "MDG", name: "Madagascar", geojsonName: "Madagascar" },
  "454": { iso3: "MWI", name: "Malawi", geojsonName: "Malawi" },
  "466": { iso3: "MLI", name: "Mali", geojsonName: "Mali" },
  "478": { iso3: "MRT", name: "Mauritania", geojsonName: "Mauritania" },
  "480": { iso3: "MUS", name: "Mauritius", geojsonName: "Mauritius" }, // Added by Marisol Morales - 3/2/2026
  "504": { iso3: "MAR", name: "Morocco", geojsonName: "Morocco" },
  "508": { iso3: "MOZ", name: "Mozambique", geojsonName: "Mozambique" },
  "516": { iso3: "NAM", name: "Namibia", geojsonName: "Namibia" },
  "562": { iso3: "NER", name: "Niger", geojsonName: "Niger" },
  "566": { iso3: "NGA", name: "Nigeria", geojsonName: "Nigeria" },
  "646": { iso3: "RWA", name: "Rwanda", geojsonName: "Rwanda" },
  "678": { iso3: "STP", name: "São Tomé and Príncipe", geojsonName: "São Tomé and Principe" }, // Added by Marisol Morales - 3/2/2026
  "686": { iso3: "SEN", name: "Senegal", geojsonName: "Senegal" },
  "694": { iso3: "SLE", name: "Sierra Leone", geojsonName: "Sierra Leone" },
  "706": { iso3: "SOM", name: "Somalia", geojsonName: "Somalia" }, // Added by Marisol Morales - 3/2/2026
  "710": { iso3: "ZAF", name: "South Africa", geojsonName: "South Africa" },
  "728": { iso3: "SSD", name: "South Sudan", geojsonName: "South Sudan" }, // Added by Marisol Morales - 3/2/2026
  "729": { iso3: "SDN", name: "Sudan", geojsonName: "Sudan" },
  "834": { iso3: "TZA", name: "Tanzania", geojsonName: "United Republic of Tanzania" },
  "768": { iso3: "TGO", name: "Togo", geojsonName: "Togo" },
  "788": { iso3: "TUN", name: "Tunisia", geojsonName: "Tunisia" },
  "800": { iso3: "UGA", name: "Uganda", geojsonName: "Uganda" },
  "894": { iso3: "ZMB", name: "Zambia", geojsonName: "Zambia" },
  "690": { iso3: "SYC", name: "Seychelles", geojsonName: "Seychelles" },
  "716": { iso3: "ZWE", name: "Zimbabwe", geojsonName: "Zimbabwe" },
  "732": { iso3: "ESH", name: "Western Sahara", geojsonName: "Western Sahara" }, // Added by Reymes 3/7/26
  "SOL": { iso3: "SOL", name: "Somaliland", geojsonName: "Somaliland" },         // Added by Reymes 3/7/26

  // ASIA
  "4": { iso3: "AFG", name: "Afghanistan", geojsonName: "Afghanistan" }, // Added by Marisol Morales - 3/2/2026
  "51": { iso3: "ARM", name: "Armenia", geojsonName: "Armenia" }, // Added by Marisol Morales - 3/2/2026
  "31": { iso3: "AZE", name: "Azerbaijan", geojsonName: "Azerbaijan" }, // Added by Marisol Morales - 3/2/2026
  "50": { iso3: "BGD", name: "Bangladesh", geojsonName: "Bangladesh" },
  "64": { iso3: "BTN", name: "Bhutan", geojsonName: "Bhutan" }, // Added by Marisol Morales - 3/2/2026
  "96": { iso3: "BRN", name: "Brunei", geojsonName: "Brunei" }, // Added by Marisol Morales - 3/2/2026
  "116": { iso3: "KHM", name: "Cambodia", geojsonName: "Cambodia" }, // Added by Marisol Morales - 3/2/2026
  "156": { iso3: "CHN", name: "China", geojsonName: "China" }, // Added by Marisol Morales - 3/2/2026
  "268": { iso3: "GEO", name: "Georgia", geojsonName: "Georgia" }, // Added by Marisol Morales - 3/2/2026
  "356": { iso3: "IND", name: "India", geojsonName: "India" },
  "360": { iso3: "IDN", name: "Indonesia", geojsonName: "Indonesia" }, // Added by Marisol Morales - 3/2/2026
  "364": { iso3: "IRN", name: "Iran", geojsonName: "Iran" }, // Added by Marisol Morales - 3/2/2026
  "368": { iso3: "IRQ", name: "Iraq", geojsonName: "Iraq" }, // Added by Marisol Morales - 3/2/2026
  "376": { iso3: "ISR", name: "Israel", geojsonName: "Israel" }, // Added by Marisol Morales - 3/2/2026
  "392": { iso3: "JPN", name: "Japan", geojsonName: "Japan" },
  "400": { iso3: "JOR", name: "Jordan", geojsonName: "Jordan" }, // Added by Marisol Morales - 3/2/2026
  "398": { iso3: "KAZ", name: "Kazakhstan", geojsonName: "Kazakhstan" }, // Added by Marisol Morales - 3/2/2026
  "408": { iso3: "PRK", name: "North Korea", geojsonName: "North Korea" }, // Added by Marisol Morales - 3/2/2026
  "410": { iso3: "KOR", name: "South Korea", geojsonName: "South Korea" },
  "414": { iso3: "KWT", name: "Kuwait", geojsonName: "Kuwait" }, // Added by Marisol Morales - 3/2/2026
  "417": { iso3: "KGZ", name: "Kyrgyzstan", geojsonName: "Kyrgyzstan" }, // Added by Marisol Morales - 3/2/2026
  "418": { iso3: "LAO", name: "Laos", geojsonName: "Laos" }, // Added by Marisol Morales - 3/2/2026
  "422": { iso3: "LBN", name: "Lebanon", geojsonName: "Lebanon" }, // Added by Marisol Morales - 3/2/2026
  "458": { iso3: "MYS", name: "Malaysia", geojsonName: "Malaysia" }, // Added by Marisol Morales - 3/2/2026
  "496": { iso3: "MNG", name: "Mongolia", geojsonName: "Mongolia" }, // Added by Marisol Morales - 3/2/2026
  "104": { iso3: "MMR", name: "Myanmar", geojsonName: "Myanmar" }, // Added by Marisol Morales - 3/2/2026
  "524": { iso3: "NPL", name: "Nepal", geojsonName: "Nepal" }, // Added by Marisol Morales - 3/2/2026
  "512": { iso3: "OMN", name: "Oman", geojsonName: "Oman" }, // Added by Marisol Morales - 3/2/2026
  "586": { iso3: "PAK", name: "Pakistan", geojsonName: "Pakistan" }, // Added by Marisol Morales - 3/2/2026
  "275": { iso3: "PSE", name: "Palestine", geojsonName: "Palestine" }, // Added by Marisol Morales - 3/2/2026
  "608": { iso3: "PHL", name: "Philippines", geojsonName: "Philippines" }, // Added by Marisol Morales - 3/2/2026
  "634": { iso3: "QAT", name: "Qatar", geojsonName: "Qatar" }, // Added by Marisol Morales - 3/2/2026
  "682": { iso3: "SAU", name: "Saudi Arabia", geojsonName: "Saudi Arabia" }, // Added by Marisol Morales - 3/2/2026
  "702": { iso3: "SGP", name: "Singapore", geojsonName: "Singapore" }, // Added by Marisol Morales - 3/2/2026
  "144": { iso3: "LKA", name: "Sri Lanka", geojsonName: "Sri Lanka" }, // Added by Marisol Morales - 3/2/2026
  "760": { iso3: "SYR", name: "Syria", geojsonName: "Syria" }, // Added by Marisol Morales - 3/2/2026
  "762": { iso3: "TJK", name: "Tajikistan", geojsonName: "Tajikistan" }, // Added by Marisol Morales - 3/2/2026
  "764": { iso3: "THA", name: "Thailand", geojsonName: "Thailand" }, // Added by Marisol Morales - 3/2/2026
  "626": { iso3: "TLS", name: "Timor-Leste", geojsonName: "East Timor" }, // Added by Marisol Morales - 3/2/2026
  "792": { iso3: "TUR", name: "Turkey", geojsonName: "Turkey" }, // Added by Marisol Morales - 3/2/2026
  "795": { iso3: "TKM", name: "Turkmenistan", geojsonName: "Turkmenistan" }, // Added by Marisol Morales - 3/2/2026
  "784": { iso3: "ARE", name: "United Arab Emirates", geojsonName: "United Arab Emirates" }, // Added by Marisol Morales - 3/2/2026
  "860": { iso3: "UZB", name: "Uzbekistan", geojsonName: "Uzbekistan" }, // Added by Marisol Morales - 3/2/2026
  "704": { iso3: "VNM", name: "Vietnam", geojsonName: "Vietnam" }, // Added by Marisol Morales - 3/2/2026
  "48":  { iso3: "BHR", name: "Bahrain", geojsonName: "Bahrain" },
  "158": { iso3: "TWN", name: "Taiwan", geojsonName: "Taiwan" },
  "462": { iso3: "MDV", name: "Maldives", geojsonName: "Maldives" },
  "887": { iso3: "YEM", name: "Yemen", geojsonName: "Yemen" }, // Added by Marisol Morales - 3/2/2026

  // EUROPE
  "8": { iso3: "ALB", name: "Albania", geojsonName: "Albania" }, // Added by Marisol Morales - 3/2/2026
  "20": { iso3: "AND", name: "Andorra", geojsonName: "Andorra" }, // Added by Marisol Morales - 3/2/2026
  "40": { iso3: "AUT", name: "Austria", geojsonName: "Austria" },
  "112": { iso3: "BLR", name: "Belarus", geojsonName: "Belarus" }, // Added by Marisol Morales - 3/2/2026
  "56": { iso3: "BEL", name: "Belgium", geojsonName: "Belgium" },
  "70": { iso3: "BIH", name: "Bosnia and Herzegovina", geojsonName: "Bosnia and Herzegovina" }, // Added by Marisol Morales - 3/2/2026
  "100": { iso3: "BGR", name: "Bulgaria", geojsonName: "Bulgaria" }, // Added by Marisol Morales - 3/2/2026
  "191": { iso3: "HRV", name: "Croatia", geojsonName: "Croatia" }, // Added by Marisol Morales - 3/2/2026
  "196": { iso3: "CYP", name: "Cyprus", geojsonName: "Cyprus" }, // Added by Marisol Morales - 3/2/2026
  "NCY": { iso3: "NCY", name: "Northern Cyprus", geojsonName: "Northern Cyprus" }, // Added by Reymes 3/7/26
  "203": { iso3: "CZE", name: "Czechia", geojsonName: "Czechia" }, // Added by Marisol Morales - 3/2/2026
  "208": { iso3: "DNK", name: "Denmark", geojsonName: "Denmark" }, // Added by Marisol Morales - 3/2/2026
  "233": { iso3: "EST", name: "Estonia", geojsonName: "Estonia" }, // Added by Marisol Morales - 3/2/2026
  "246": { iso3: "FIN", name: "Finland", geojsonName: "Finland" }, // Added by Marisol Morales - 3/2/2026
  "250": { iso3: "FRA", name: "France", geojsonName: "France" },
  "276": { iso3: "DEU", name: "Germany", geojsonName: "Germany" },
  "300": { iso3: "GRC", name: "Greece", geojsonName: "Greece" }, // Added by Marisol Morales - 3/2/2026
  "348": { iso3: "HUN", name: "Hungary", geojsonName: "Hungary" }, // Added by Marisol Morales - 3/2/2026
  "352": { iso3: "ISL", name: "Iceland", geojsonName: "Iceland" }, // Added by Marisol Morales - 3/2/2026
  "372": { iso3: "IRL", name: "Ireland", geojsonName: "Ireland" }, // Added by Marisol Morales - 3/2/2026
  "380": { iso3: "ITA", name: "Italy", geojsonName: "Italy" },
  "428": { iso3: "LVA", name: "Latvia", geojsonName: "Latvia" }, // Added by Marisol Morales - 3/2/2026
  "440": { iso3: "LTU", name: "Lithuania", geojsonName: "Lithuania" }, // Added by Marisol Morales - 3/2/2026
  "442": { iso3: "LUX", name: "Luxembourg", geojsonName: "Luxembourg" }, // Added by Marisol Morales - 3/2/2026
  "807": { iso3: "MKD", name: "North Macedonia", geojsonName: "North Macedonia" }, // Added by Marisol Morales - 3/2/2026
  "470": { iso3: "MLT", name: "Malta", geojsonName: "Malta" }, // Added by Marisol Morales - 3/2/2026
  "498": { iso3: "MDA", name: "Moldova", geojsonName: "Moldova" }, // Added by Marisol Morales - 3/2/2026
  "499": { iso3: "MNE", name: "Montenegro", geojsonName: "Montenegro" }, // Added by Marisol Morales - 3/2/2026
  "528": { iso3: "NLD", name: "Netherlands", geojsonName: "Netherlands" },
  "578": { iso3: "NOR", name: "Norway", geojsonName: "Norway" },
  "616": { iso3: "POL", name: "Poland", geojsonName: "Poland" }, // Added by Marisol Morales - 3/2/2026
  "620": { iso3: "PRT", name: "Portugal", geojsonName: "Portugal" }, // Added by Marisol Morales - 3/2/2026
  "642": { iso3: "ROU", name: "Romania", geojsonName: "Romania" }, // Added by Marisol Morales - 3/2/2026
  "643": { iso3: "RUS", name: "Russia", geojsonName: "Russia" }, // Added by Marisol Morales - 3/2/2026
  "688": { iso3: "SRB", name: "Serbia", geojsonName: "Republic of Serbia" }, // Added by Marisol Morales - 3/2/2026
  "703": { iso3: "SVK", name: "Slovakia", geojsonName: "Slovakia" }, // Added by Marisol Morales - 3/2/2026
  "705": { iso3: "SVN", name: "Slovenia", geojsonName: "Slovenia" }, // Added by Marisol Morales - 3/2/2026
  "724": { iso3: "ESP", name: "Spain", geojsonName: "Spain" },
  "752": { iso3: "SWE", name: "Sweden", geojsonName: "Sweden" },
  "756": { iso3: "CHE", name: "Switzerland", geojsonName: "Switzerland" },
  "804": { iso3: "UKR", name: "Ukraine", geojsonName: "Ukraine" }, // Added by Marisol Morales - 3/2/2026
  "438": { iso3: "LIE", name: "Liechtenstein", geojsonName: "Liechtenstein" },
  "492": { iso3: "MCO", name: "Monaco", geojsonName: "Monaco" },
  "674": { iso3: "SMR", name: "San Marino", geojsonName: "San Marino" },
  "826": { iso3: "GBR", name: "United Kingdom", geojsonName: "United Kingdom" },
  "XKX": { iso3: "XKX", name: "Kosovo", geojsonName: "Kosovo" },
  "304": { iso3: "GRL", name: "Greenland", geojsonName: "Greenland" },         // Added by Reymes 3/7/26
  "336": { iso3: "VAT", name: "Vatican", geojsonName: "Vatican" },             // Added by Reymes 3/7/26

  // NORTH AMERICA & CARIBBEAN
  "44": { iso3: "BHS", name: "Bahamas", geojsonName: "The Bahamas" }, // Added by Marisol Morales - 3/2/2026
  "84": { iso3: "BLZ", name: "Belize", geojsonName: "Belize" }, // Added by Marisol Morales - 3/2/2026
  "124": { iso3: "CAN", name: "Canada", geojsonName: "Canada" },
  "188": { iso3: "CRI", name: "Costa Rica", geojsonName: "Costa Rica" }, // Added by Marisol Morales - 3/2/2026
  "192": { iso3: "CUB", name: "Cuba", geojsonName: "Cuba" }, // Added by Marisol Morales - 3/2/2026
  "214": { iso3: "DOM", name: "Dominican Republic", geojsonName: "Dominican Republic" }, // Added by Marisol Morales - 3/2/2026
  "222": { iso3: "SLV", name: "El Salvador", geojsonName: "El Salvador" }, // Added by Marisol Morales - 3/2/2026
  "320": { iso3: "GTM", name: "Guatemala", geojsonName: "Guatemala" }, // Added by Marisol Morales - 3/2/2026
  "332": { iso3: "HTI", name: "Haiti", geojsonName: "Haiti" }, // Added by Marisol Morales - 3/2/2026
  "340": { iso3: "HND", name: "Honduras", geojsonName: "Honduras" }, // Added by Marisol Morales - 3/2/2026
  "388": { iso3: "JAM", name: "Jamaica", geojsonName: "Jamaica" }, // Added by Marisol Morales - 3/2/2026
  "484": { iso3: "MEX", name: "Mexico", geojsonName: "Mexico" },
  "558": { iso3: "NIC", name: "Nicaragua", geojsonName: "Nicaragua" }, // Added by Marisol Morales - 3/2/2026
  "591": { iso3: "PAN", name: "Panama", geojsonName: "Panama" }, // Added by Marisol Morales - 3/2/2026
  "630": { iso3: "PRI", name: "Puerto Rico", geojsonName: "Puerto Rico" },     // Added by Reymes 3/7/26
  "780": { iso3: "TTO", name: "Trinidad and Tobago", geojsonName: "Trinidad and Tobago" }, // Added by Marisol Morales - 3/2/2026
  "28":  { iso3: "ATG", name: "Antigua and Barbuda", geojsonName: "Antigua and Barbuda" },
  "52":  { iso3: "BRB", name: "Barbados", geojsonName: "Barbados" },
  "212": { iso3: "DMA", name: "Dominica", geojsonName: "Dominica" },
  "308": { iso3: "GRD", name: "Grenada", geojsonName: "Grenada" },
  "659": { iso3: "KNA", name: "Saint Kitts and Nevis", geojsonName: "Saint Kitts and Nevis" },
  "662": { iso3: "LCA", name: "Saint Lucia", geojsonName: "Saint Lucia" },
  "670": { iso3: "VCT", name: "Saint Vincent and the Grenadines", geojsonName: "Saint Vincent and the Grenadines" },
  "840": { iso3: "USA", name: "United States", geojsonName: "United States of America" },

  // SOUTH AMERICA
  "32": { iso3: "ARG", name: "Argentina", geojsonName: "Argentina" }, // Added by Marisol Morales - 3/2/2026
  "68": { iso3: "BOL", name: "Bolivia", geojsonName: "Bolivia" }, // Added by Marisol Morales - 3/2/2026
  "76": { iso3: "BRA", name: "Brazil", geojsonName: "Brazil" },
  "152": { iso3: "CHL", name: "Chile", geojsonName: "Chile" }, // Added by Marisol Morales - 3/2/2026
  "170": { iso3: "COL", name: "Colombia", geojsonName: "Colombia" }, // Added by Marisol Morales - 3/2/2026
  "218": { iso3: "ECU", name: "Ecuador", geojsonName: "Ecuador" }, // Added by Marisol Morales - 3/2/2026
  "328": { iso3: "GUY", name: "Guyana", geojsonName: "Guyana" }, // Added by Marisol Morales - 3/2/2026
  "600": { iso3: "PRY", name: "Paraguay", geojsonName: "Paraguay" }, // Added by Marisol Morales - 3/2/2026
  "604": { iso3: "PER", name: "Peru", geojsonName: "Peru" }, // Added by Marisol Morales - 3/2/2026
  "740": { iso3: "SUR", name: "Suriname", geojsonName: "Suriname" }, // Added by Marisol Morales - 3/2/2026
  "858": { iso3: "URY", name: "Uruguay", geojsonName: "Uruguay" }, // Added by Marisol Morales - 3/2/2026
  "862": { iso3: "VEN", name: "Venezuela", geojsonName: "Venezuela" }, // Added by Marisol Morales - 3/2/2026

  // OCEANIA
  "36": { iso3: "AUS", name: "Australia", geojsonName: "Australia" },
  "242": { iso3: "FJI", name: "Fiji", geojsonName: "Fiji" }, // Added by Marisol Morales - 3/2/2026
  "598": { iso3: "PNG", name: "Papua New Guinea", geojsonName: "Papua New Guinea" }, // Added by Marisol Morales - 3/2/2026
  "090": { iso3: "SLB", name: "Solomon Islands", geojsonName: "Solomon Islands" }, // Added by Marisol Morales - 3/2/2026
  "548": { iso3: "VUT", name: "Vanuatu", geojsonName: "Vanuatu" }, // Added by Marisol Morales - 3/2/2026
  "296": { iso3: "KIR", name: "Kiribati", geojsonName: "Kiribati" },
  "520": { iso3: "NRU", name: "Nauru", geojsonName: "Nauru" },
  "554": { iso3: "NZL", name: "New Zealand", geojsonName: "New Zealand" }, // Added by Marisol Morales - 3/2/2026
  "583": { iso3: "FSM", name: "Micronesia", geojsonName: "Federated States of Micronesia" },
  "584": { iso3: "MHL", name: "Marshall Islands", geojsonName: "Marshall Islands" },
  "585": { iso3: "PLW", name: "Palau", geojsonName: "Palau" },
  "776": { iso3: "TON", name: "Tonga", geojsonName: "Tonga" },
  "798": { iso3: "TUV", name: "Tuvalu", geojsonName: "Tuvalu" },
  "882": { iso3: "WSM", name: "Samoa", geojsonName: "Samoa" },
}

function MapFlyTo({ selectedGeoId, onMapReady }: { selectedGeoId: string | null; onMapReady?: (map: L.Map) => void }) {
  const map = useMap()
  // Added by Reymes 3/2/26 - prevent repeated flyTo on same selected country
  const lastFlownGeoIdRef = useRef<string | null>(null)

  useEffect(() => {
    onMapReady?.(map)
  }, [map, onMapReady])

  useEffect(() => {
    if (!selectedGeoId) {
      if (lastFlownGeoIdRef.current !== null) {
        lastFlownGeoIdRef.current = null
        map.flyTo([20, 0], 2, { duration: 0.8 })
      }
      return
    }
    // Added by Reymes 3/2/26 - skip flyTo if selection did not change
    if (lastFlownGeoIdRef.current === selectedGeoId) return
    const c = COORDS[selectedGeoId]
    if (!c) return
    // Added by Reymes 3/2/26 - persist last flown country to prevent repeated recentering
    lastFlownGeoIdRef.current = selectedGeoId
    map.flyTo([c.lat, c.lng], 4, { duration: 0.8 })
  }, [selectedGeoId, map])

  return null
}

export default function StatisticsMapLeaflet({
  selectedGeoId,
  onCountryClick,
  mapRows,
  rateType = "national",
  showSchools = false,
  showHospitals = false,
  onSelectedFacilityDistanceChange,
}: Props) {
  //START added by Damon 3/24/26
  const [geojsonData, setGeojsonData] = useState<{ features: Record<string, unknown>[] } | null>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const showFacilityDistanceOverlay = showSchools || showHospitals
  const facilityDistanceLabel = showSchools && showHospitals
    ? "Avg distance to school/hospital"
    : showSchools
      ? "Avg distance to school"
      : "Avg distance to hospital"
//END added by Damon 3/24/26
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
  // Updated by Reymes 3/2/26 - use national poverty rates for developed countries
  // Create a map of country ISO3 to poverty rate from mapRows
  const povertyRateMap = React.useMemo(() => {
    const rates: Record<string, number> = {}

    const rowsByIso: Record<string, MapRow> = {}
    if (Array.isArray(mapRows) && mapRows.length > 0) {
      mapRows.forEach((row) => {
        if (!row?.country) return
        rowsByIso[row.country.toUpperCase()] = row
      })
    }

    Object.entries(COUNTRY_CODE_MAP).forEach(([geoId, mapping]) => {
      const iso3 = mapping.iso3
      const row = rowsByIso[iso3]
      const raw = row?.headcount

      // Added by Reymes 3/2/26 - apply filter logic: national shows national rates, international shows API only
      if (rateType === "national") {
        // National filter: strict national-only mode (no international fallback)
        const nationalData = NATIONAL_POVERTY_RATES[iso3]
        if (nationalData && typeof nationalData.rate === "number") {
          rates[geoId] = nationalData.rate
        }
      } else {
        // International filter: use PIP API data, fall back to static estimates for countries with no PIP coverage
        if (typeof raw === "number" && Number.isFinite(raw)) {
          const normalized = normalizeRate(raw)
          if (normalized !== null) {
            rates[geoId] = normalized
            return
          }
        }
        // Added by Reymes 3/7/26 - apply fallback for conflict zones, closed economies and high-income nations
        // that the World Bank PIP API does not cover
        const fallback = INTERNATIONAL_FALLBACK_RATES[iso3]
        if (fallback !== undefined) {
          const normalized = normalizeRate(fallback)
          if (normalized !== null) {
            rates[geoId] = normalized
          }
        }
      }
    })

    return rates
  }, [mapRows, rateType])

  //START added by Damon 3/24/26 - create a map of country geoId to average distance to nearest facility (school/hospital) based on selected filters
  const facilityDistanceMap = React.useMemo(() => {
    const distances: Record<string, number> = {}

    if (!showFacilityDistanceOverlay) {
      return distances
    }

    Object.entries(COUNTRY_CODE_MAP).forEach(([geoId, mapping]) => {
      const countryCenter = COORDS[geoId]
      if (!countryCenter) return

      const relevantFacilities = FACILITIES.filter((facility) => {
        if (facility.country !== mapping.iso3) return false
        if (showSchools && showHospitals) return true
        if (showSchools) return facility.type === "school"
        return facility.type === "hospital"
      })

      if (relevantFacilities.length === 0) {
        return
      }

      const averageDistanceKm =
        relevantFacilities.reduce((totalDistance, facility) => {
          return totalDistance + haversineDistanceKm(countryCenter.lat, countryCenter.lng, facility.lat, facility.lng)
        }, 0) / relevantFacilities.length

      distances[geoId] = averageDistanceKm
    })

    return distances
  }, [showFacilityDistanceOverlay, showSchools, showHospitals])

  useEffect(() => {
    if (!onSelectedFacilityDistanceChange) return
    if (!showFacilityDistanceOverlay || !selectedGeoId) {
      onSelectedFacilityDistanceChange(null)
      return
    }
    onSelectedFacilityDistanceChange(facilityDistanceMap[selectedGeoId] ?? null)
  }, [
    facilityDistanceMap,
    onSelectedFacilityDistanceChange,
    selectedGeoId,
    showFacilityDistanceOverlay,
  ])
  //END added by Damon 3/24/26 - create a map of country geoId to average distance to nearest facility (school/hospital) based on selected filters
  
  // Add countries to map
  useEffect(() => {
    if (!geojsonData?.features || !map) {
      return
    }

    console.log("Adding countries to map...")
    console.log("povertyRateMap:", povertyRateMap)
    console.log("Total countries in povertyRateMap:", Object.keys(povertyRateMap).length) //debugging log to check how many countries have poverty rates in our map - Reymes

    const layers: L.GeoJSON[] = []
    let matchedCount = 0
    const unmatchedCountries: string[] = [] // For logging unmatched countries - Reymes

    geojsonData.features.forEach((feature: Record<string, unknown>) => {
      const countryName = (feature.properties as Record<string, unknown>)?.name as string
      if (!countryName) return

      let matchingGeoId: string | null = null
      for (const [geoId, mapping] of Object.entries(COUNTRY_CODE_MAP)) {
        if (mapping.geojsonName === countryName) {
          matchingGeoId = geoId
          break
        }
      }

      if (matchingGeoId) {
        matchedCount++
      } else {
        unmatchedCountries.push(countryName) // Add to unmatched list for logging - Reymes
      }

      const overlayValue = matchingGeoId
        ? (showFacilityDistanceOverlay ? facilityDistanceMap[matchingGeoId] : povertyRateMap[matchingGeoId])
        : null
      // Use purple for tracked countries with no data, grey for untracked countries - Reymes 2/20/26
      let baseColor;
      if (matchingGeoId && (overlayValue === null || overlayValue === undefined)) {
        baseColor = "#9370DB"; // Purple for tracked but no data available
      } else {
        baseColor = showFacilityDistanceOverlay ? getDistanceColor(overlayValue) : getPovertyColor(overlayValue);
      }

      if (matchingGeoId && overlayValue !== null && overlayValue !== undefined) {
        console.log(`${countryName} (geoId: ${matchingGeoId}): overlayValue=${overlayValue.toFixed(2)}${showFacilityDistanceOverlay ? " km" : "%"}, color=${baseColor}`)
      } else if (matchingGeoId) {
        console.log(`${countryName} (geoId: ${matchingGeoId}): NO DATA AVAILABLE (purple)`) // Log tracked countries with no data - Reymes
      }

      const layer = L.geoJSON(feature as unknown as GeoJSON.Feature, {
        style: () => ({
          fillColor: baseColor,
          color: matchingGeoId ? "#333" : "#999",  // Lighter border for untracked countries Reymes
          weight: matchingGeoId ? 1 : 0.5,
          opacity: 1,
          fillOpacity: matchingGeoId ? 0.8 : 0.3,  // More opacity for tracked countries, less for untracked Reymes
        }),
      })

      layer.eachLayer((subLayer: L.Layer) => {
        // Only add tooltip and click handler if this is a tracked country
        if (matchingGeoId) {
          // Added by Reymes 3/2/26 - include national poverty line in tooltip when available
          let tooltipContent: string;
          if (overlayValue !== null && overlayValue !== undefined) {
            if (showFacilityDistanceOverlay) {
              tooltipContent = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem;">${facilityDistanceLabel}: ${overlayValue.toFixed(0)} km</div>`;
            } else {
              const countryIso = COUNTRY_CODE_MAP[matchingGeoId]?.iso3;
              const nationalData = countryIso ? NATIONAL_POVERTY_RATES[countryIso] : null;
              let povLineInfo = "";
              // Added by Reymes 3/2/26 - only show national poverty line when in national filter mode
              if (rateType === "national" && nationalData && typeof nationalData === "object" && "povLine" in nationalData) {
                povLineInfo = `<div style="font-size: 0.7rem; color: #555;">Line: ${nationalData.povLine.toLocaleString()} ${nationalData.currency}/yr</div>`;
              }
              tooltipContent = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem;">Poverty Rate: ${overlayValue.toFixed(2)}%</div>${povLineInfo}`;
            }
          } else {
            tooltipContent = `<div style="font-weight: bold;">${countryName}</div><div style="font-size: 0.75rem; color: #9370DB;">No ${showFacilityDistanceOverlay ? "distance" : "poverty"} data available</div>`;
          }
          (subLayer as L.Path).bindTooltip(tooltipContent)
          subLayer.on("click", () => {
            console.log("Clicked:", matchingGeoId)
            onCountryClick(matchingGeoId!)
          })
          subLayer.on("mouseover", () => {
            (subLayer as L.Path).setStyle({ fillColor: "#FFD700", weight: 2 })
          })
          subLayer.on("mouseout", () => {
            (subLayer as L.Path).setStyle({ fillColor: baseColor, weight: 1 })
          })
        }
      })

      layer.addTo(map)
      layers.push(layer)
    })

    console.log(`Added ${layers.length} country layers (${matchedCount} matched to our data)`)
    if (unmatchedCountries.length > 0) {
      console.log("Unmatched countries:", unmatchedCountries.slice(0, 10).join(", "), unmatchedCountries.length > 10 ? `... and ${unmatchedCountries.length - 10} more` : "") //debugging log to check which countries in the GeoJSON did not match our mapping - Reymes
    }

    return () => {
      layers.forEach((layer) => map.removeLayer(layer))
    }
  }, [geojsonData, map, povertyRateMap, facilityDistanceMap, onCountryClick, rateType, showFacilityDistanceOverlay, facilityDistanceLabel])

  // Added by Damon 3/19/26 - render school and hospital pins on map with clustering
  useEffect(() => {
    if (!map) return
    if (!showSchools && !showHospitals) return

    // Get ISO3 code for selected country; if none selected, render global pins.
    const selectedIso3 = selectedGeoId ? COUNTRY_CODE_MAP[selectedGeoId]?.iso3 : null
    if (selectedGeoId && !selectedIso3) return

    // Create a marker cluster group - added by Damon 3/19/26 for spiderfication on zoom
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60, // Pixels - clusters spread out more aggressively
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    })

    // Helper function to create custom icon
    const createFacilityIcon = (type: "school" | "hospital") => {
      const iconColor = type === "school" ? "#3B82F6" : "#EF4444" // Blue for schools, red for hospitals
      const emoji = type === "school" ? "🏫" : "🏥"
      return L.divIcon({
        className: "facility-icon",
        html: `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: white;
          border: 2px solid ${iconColor};
          border-radius: 50%;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
    }

    // Add school markers if enabled
    if (showSchools) {
      const schools = selectedIso3
        ? getSchoolsByCountry(selectedIso3)
        : FACILITIES.filter((facility) => facility.type === "school")
      schools.forEach((school) => {
        const marker = L.marker([school.lat, school.lng], {
          icon: createFacilityIcon("school"),
        }).bindTooltip(`<div style="font-weight: bold; font-size: 0.85rem;">${school.name}</div><div style="font-size: 0.75rem; color: #3B82F6;">📚 School</div>`)
        clusterGroup.addLayer(marker)
      })
    }

    // Add hospital markers if enabled
    if (showHospitals) {
      const hospitals = selectedIso3
        ? getHospitalsByCountry(selectedIso3)
        : FACILITIES.filter((facility) => facility.type === "hospital")
      hospitals.forEach((hospital) => {
        const marker = L.marker([hospital.lat, hospital.lng], {
          icon: createFacilityIcon("hospital"),
        }).bindTooltip(`<div style="font-weight: bold; font-size: 0.85rem;">${hospital.name}</div><div style="font-size: 0.75rem; color: #EF4444;">🏥 Hospital</div>`)
        clusterGroup.addLayer(marker)
      })
    }

    // Add cluster group to map
    map.addLayer(clusterGroup)

    // Cleanup: remove cluster group from map
    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [map, selectedGeoId, showSchools, showHospitals])

  return (
    <div className="relative w-full h-[360px] rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        minZoom={2}
        maxZoom={6}
        maxBounds={[[-85, -180], [85, 180]]}
        // Added by Reymes 3/2/26 - soften bounds lock to reduce stuck-on-USA feel
        maxBoundsViscosity={0.5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo selectedGeoId={selectedGeoId} onMapReady={setMap} />
      </MapContainer>

      {/* Added by Reymes 3/2/26 - bottom-left map legend */}
      <div
        className="absolute bottom-3 left-3 z-[1000] rounded-md px-3 py-2 text-xs shadow-md map-legend" //Modified for High contrast mode added by Damon 3/4/2026
        style={{ backgroundColor: "rgba(255, 255, 255, 0.92)", color: "#222" }}
      >
        <div className="font-semibold mb-1">{showFacilityDistanceOverlay ? `${facilityDistanceLabel} key` : "Poverty rate key"}</div>
        {showFacilityDistanceOverlay ? (
          <>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#8B0000" }} />&gt; 1200 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#DC143C" }} />900 - 1200 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FF6347" }} />600 - 900 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFA500" }} />300 - 600 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFD700" }} />150 - 300 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#90EE90" }} />0 - 150 km</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#9370DB" }} />Missing facility data</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#8B0000" }} />&gt; 40%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#DC143C" }} />30% - 40%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FF6347" }} />20% - 30%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFA500" }} />10% - 20%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#FFD700" }} />5% - 10%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#90EE90" }} />0% - 5%</div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#9370DB" }} />Untracked, missing data</div>
          </>
        )}
      </div>
    </div>
  )
}