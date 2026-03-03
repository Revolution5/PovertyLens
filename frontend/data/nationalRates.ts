// Added by Reymes 3/2/26 - National poverty rates and lines for tracked countries
// Includes poverty rates (% of population) and poverty line thresholds (annual income)

export interface NationalPovertyData {
  rate: number;           // Percentage of population in poverty
  povLine: number;        // Annual income poverty line threshold
  currency: string;       // Currency of poverty line
  year: number;           // Year data is from
  description: string;    // Brief description of methodology
}

export const NATIONAL_POVERTY_RATES: Record<string, NationalPovertyData> = {
  // AFRICA
  "DZA": { rate: 5.5, povLine: 67200, currency: "DZD", year: 2022, description: "Interim national poverty rate estimate" },
  "AGO": { rate: 32.3, povLine: 187200, currency: "AOA", year: 2022, description: "Interim national poverty rate estimate" },
  "BEN": { rate: 38.5, povLine: 268800, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "BWA": { rate: 16.3, povLine: 8640, currency: "BWP", year: 2022, description: "Interim national poverty rate estimate" },
  "BFA": { rate: 40.1, povLine: 273600, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "BDI": { rate: 65.0, povLine: 576000, currency: "BIF", year: 2022, description: "Interim national poverty rate estimate" },
  "CMR": { rate: 37.5, povLine: 328800, currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "CAF": { rate: 62.0, povLine: 309600, currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "TCD": { rate: 42.3, povLine: 273600, currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "COG": { rate: 39.2, povLine: 312000, currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "COD": { rate: 73.0, povLine: 840000, currency: "CDF", year: 2022, description: "Interim national poverty rate estimate" },
  "CIV": { rate: 39.4, povLine: 312000, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "EGY": { rate: 29.7, povLine: 14640, currency: "EGP", year: 2022, description: "Interim national poverty rate estimate" },
  "ETH": { rate: 24.1, povLine: 8760, currency: "ETB", year: 2022, description: "Interim national poverty rate estimate" },
  "SWZ": { rate: 58.0, povLine: 15600, currency: "SZL", year: 2022, description: "Interim national poverty rate estimate" },
  "GAB": { rate: 33.0, povLine: 319200, currency: "XAF", year: 2022, description: "Interim national poverty rate estimate" },
  "GMB": { rate: 48.1, povLine: 15360, currency: "GMD", year: 2022, description: "Interim national poverty rate estimate" },
  "GHA": { rate: 24.2, povLine: 10920, currency: "GHS", year: 2022, description: "Interim national poverty rate estimate" },
  "GIN": { rate: 43.8, povLine: 4560000, currency: "GNF", year: 2022, description: "Interim national poverty rate estimate" },
  "KEN": { rate: 36.1, povLine: 43800, currency: "KES", year: 2022, description: "Interim national poverty rate estimate" },
  "LSO": { rate: 49.4, povLine: 10560, currency: "LSL", year: 2022, description: "Interim national poverty rate estimate" },
  "LBR": { rate: 50.9, povLine: 216000, currency: "LRD", year: 2022, description: "Interim national poverty rate estimate" },
  "MDG": { rate: 75.2, povLine: 3650000, currency: "MGA", year: 2022, description: "Interim national poverty rate estimate" },
  "MWI": { rate: 51.5, povLine: 432000, currency: "MWK", year: 2022, description: "Interim national poverty rate estimate" },
  "MLI": { rate: 42.0, povLine: 292800, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "MRT": { rate: 31.2, povLine: 14640, currency: "MRU", year: 2022, description: "Interim national poverty rate estimate" },
  "MAR": { rate: 4.8, povLine: 9480, currency: "MAD", year: 2022, description: "Interim national poverty rate estimate" },
  "MOZ": { rate: 63.0, povLine: 43800, currency: "MZN", year: 2022, description: "Interim national poverty rate estimate" },
  "NAM": { rate: 18.0, povLine: 10920, currency: "NAD", year: 2022, description: "Interim national poverty rate estimate" },
  "NER": { rate: 44.2, povLine: 273600, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "NGA": { rate: 40.1, povLine: 153600, currency: "NGN", year: 2022, description: "Interim national poverty rate estimate" },
  "RWA": { rate: 38.4, povLine: 438000, currency: "RWF", year: 2022, description: "Interim national poverty rate estimate" },
  "SEN": { rate: 37.0, povLine: 273600, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "SLE": { rate: 56.3, povLine: 21600000, currency: "SLL", year: 2022, description: "Interim national poverty rate estimate" },
  "ZAF": { rate: 55.5, povLine: 13440, currency: "ZAR", year: 2022, description: "Interim national poverty rate estimate" },
  "SDN": { rate: 46.0, povLine: 456000, currency: "SDG", year: 2022, description: "Interim national poverty rate estimate" },
  "TZA": { rate: 26.4, povLine: 438000, currency: "TZS", year: 2022, description: "Interim national poverty rate estimate" },
  "TGO": { rate: 45.0, povLine: 273600, currency: "XOF", year: 2022, description: "Interim national poverty rate estimate" },
  "TUN": { rate: 16.0, povLine: 6480, currency: "TND", year: 2022, description: "Interim national poverty rate estimate" },
  "UGA": { rate: 41.3, povLine: 511000, currency: "UGX", year: 2022, description: "Interim national poverty rate estimate" },
  "ZMB": { rate: 54.4, povLine: 10920, currency: "ZMW", year: 2022, description: "Interim national poverty rate estimate" },
  "ZWE": { rate: 39.2, povLine: 3600, currency: "USD", year: 2022, description: "Interim national poverty rate estimate" },

  // ASIA
  "BGD": { rate: 18.7, povLine: 30000, currency: "BDT", year: 2022, description: "Interim national poverty rate estimate" },
  "IND": { rate: 21.9, povLine: 19200, currency: "INR", year: 2022, description: "Interim national poverty rate estimate" },
  "JPN": {
    rate: 15.7,
    povLine: 1728000,
    currency: "JPY",
    year: 2021,
    description: "50% of median household income"
  },
  "KOR": {
    rate: 16.7,
    povLine: 17900000,
    currency: "KRW",
    year: 2021,
    description: "50% of median household income"
  },

  // EUROPE
  "AUT": {
    rate: 13.9,
    povLine: 11544,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "BEL": {
    rate: 15.1,
    povLine: 11256,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "FRA": {
    rate: 14.5,
    povLine: 11340,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "DEU": {
    rate: 14.8,
    povLine: 12300,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "ITA": {
    rate: 20.1,
    povLine: 10524,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "NLD": {
    rate: 11.6,
    povLine: 13680,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "NOR": {
    rate: 10.4,
    povLine: 127680,
    currency: "NOK",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "ESP": {
    rate: 20.4,
    povLine: 10089,
    currency: "EUR",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "SWE": {
    rate: 16.1,
    povLine: 105600,
    currency: "SEK",
    year: 2022,
    description: "60% of median equivalised income"
  },
  "CHE": {
    rate: 8.7,
    povLine: 28800,
    currency: "CHF",
    year: 2021,
    description: "SILC relative poverty line"
  },
  "GBR": {
    rate: 18.0,
    povLine: 12570,
    currency: "GBP",
    year: 2022,
    description: "60% of median net household income"
  },

  // NORTH AMERICA
  "CAN": {
    rate: 9.4,
    povLine: 17602,
    currency: "CAD",
    year: 2022,
    description: "Statistics Canada Low Income Cut-Off"
  },
  "MEX": { rate: 36.3, povLine: 33000, currency: "MXN", year: 2022, description: "Interim national poverty rate estimate" },
  "USA": {
    rate: 10.6,
    povLine: 14580,
    currency: "USD",
    year: 2023,
    description: "US Census Bureau poverty line (single adult)"
  },

  // SOUTH AMERICA
  "BRA": { rate: 29.0, povLine: 8400, currency: "BRL", year: 2022, description: "Interim national poverty rate estimate" },

  // OCEANIA
  "AUS": {
    rate: 13.4,
    povLine: 19000,
    currency: "AUD",
    year: 2021,
    description: "Henderson poverty line (single)"
  },
};

export type NationalRateCountry = keyof typeof NATIONAL_POVERTY_RATES;

// Added by Reymes 3/2/26 - poverty rate as percentage
export function getNationalRate(iso3: string): number | null {
  const normalized = iso3.toUpperCase();
  const data = NATIONAL_POVERTY_RATES[normalized];
  return data?.rate ?? null;
}

// Added by Reymes 3/2/26 - national poverty data
export function getNationalPovertyData(iso3: string): NationalPovertyData | null {
  const normalized = iso3.toUpperCase();
  return NATIONAL_POVERTY_RATES[normalized] ?? null;
}

// Added by Reymes 3/2/26 - poverty line threshold
export function getNationalPovertyLine(iso3: string): { amount: number; currency: string } | null {
  const normalized = iso3.toUpperCase();
  const data = NATIONAL_POVERTY_RATES[normalized];
  return data ? { amount: data.povLine, currency: data.currency } : null;
}

export function hasNationalRate(iso3: string): boolean {
  return iso3.toUpperCase() in NATIONAL_POVERTY_RATES;
}
