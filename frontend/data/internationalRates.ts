// Added by Reymes 3/2/26 - International poverty rates using World Bank $2.15/day line
// These rates come from the World Bank PIP (Poverty and Inequality Platform) API
// They represent the percentage of population living below $2.15 per day (2017 PPP)

export type InternationalRateSource = "api" | "cached" | "fallback";

export interface InternationalRate {
  iso3: string;
  rate: number; // percentage (0-100) or decimal (0-1) depending on API response
  year?: number;
  source?: InternationalRateSource;
  fetchedAt?: string;
}

// Helper function to normalize rate to percentage format (0-100)
export function normalizeRate(rate: number | null | undefined): number | null {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) {
    return null;
  }
  // If rate is between 0 and 1, assume it's decimal format, convert to percentage
  if (rate >= 0 && rate <= 1) {
    return rate * 100;
  }
  // Otherwise assume it's already in percentage format
  return rate;
}

// Helper function to get international rate from a map row
export function getInternationalRate(
  headcount: number | null | undefined
): number | null {
  return normalizeRate(headcount);
}

export const INTERNATIONAL_RATE_POVERTY_LINE = 2.15; // Daily USD in 2017 PPP
export const INTERNATIONAL_RATE_YEAR = 2022; // Default year for international rates
export const INTERNATIONAL_RATE_POVLINE = 2.15; // Matches INTERNATIONAL_RATE_POVERTY_LINE

// Added by Reymes 3/7/26 - Static fallback $2.15/day rates for countries the World Bank PIP API
// cannot cover: conflict zones, closed economies, high-income nations, and micro-states.
// Only countries that return null from PIP need to be listed here.
// Values are in decimal format (0-1) to match PIP API headcount format.
// Sources: World Bank WDI, UNDP, UN OCHA, national statistical offices.
export const INTERNATIONAL_FALLBACK_RATES: Record<string, number> = {
  // ── AFRICA: no PIP survey data ───────────────────────────────────────────
  "ERI": 0.380, // no household surveys conducted
  "GNQ": 0.260, // no recent PIP surveys
  "LBY": 0.022, // conflict zone
  "SOM": 0.560, // conflict zone - UN/World Bank estimate
  "SSD": 0.650, // fragile new state - World Bank estimate
  "SYC": 0.020, // high-income island, not in PIP
  "ESH": 0.350, // administered by Morocco, limited data - Added by Reymes 3/7/26
  "SOL": 0.540, // Somaliland - similar to Somalia, estimated - Added by Reymes 3/7/26

  // ── ASIA: conflict zones, closed economies, high-income ──────────────────
  "AFG": 0.700, // fragile state - sometimes missing from PIP - Added by Reymes 3/7/26
  "KHM": 0.021, // sometimes returns null from PIP - Added by Reymes 3/7/26
  "ARE": 0.001, // high-income, not in PIP
  "BHR": 0.001, // high-income, not in PIP
  "BRN": 0.001, // high-income, not in PIP
  "IRN": 0.010, // limited survey access
  "ISR": 0.005, // high-income, not in PIP
  "JPN": 0.003, // high-income, not in PIP
  "KOR": 0.002, // high-income, not in PIP
  "KWT": 0.001, // high-income, not in PIP
  "LBN": 0.120, // economic crisis, not in PIP
  "OMN": 0.001, // high-income, not in PIP
  "PRK": 0.420, // closed economy - UN/WFP estimate
  "QAT": 0.001, // high-income, not in PIP
  "SAU": 0.002, // high-income, not in PIP
  "SGP": 0.001, // high-income, not in PIP
  "SYR": 0.600, // conflict zone - UN OCHA estimate
  "TKM": 0.018, // closed economy, not in PIP
  "TWN": 0.003, // not a World Bank member
  "YEM": 0.480, // conflict zone - UN OCHA estimate

  // ── EUROPE: high-income nations not in PIP ───────────────────────────────
  "AND": 0.001, "AUT": 0.002, "BEL": 0.002, "CHE": 0.002, "CYP": 0.004,
  "CZE": 0.005, "DEU": 0.002, "DNK": 0.002, "ESP": 0.005, "EST": 0.005,
  "FIN": 0.002, "FRA": 0.002, "GBR": 0.002, "GRC": 0.008, "HRV": 0.006,
  "HUN": 0.007, "IRL": 0.002, "ISL": 0.001, "ITA": 0.010, "LIE": 0.001,
  "LTU": 0.008, "LUX": 0.001, "LVA": 0.008, "MCO": 0.001, "MLT": 0.004,
  "NLD": 0.002, "NOR": 0.002, "POL": 0.005, "PRT": 0.005, "ROU": 0.020,
  "SMR": 0.001, "SVK": 0.005, "SVN": 0.004, "SWE": 0.002,
  "XKX": 0.020, // not in World Bank official datasets
  "GRL": 0.005, // Greenland - high-income Danish territory - Added by Reymes 3/7/26
  "VAT": 0.001, // Vatican City - no poverty measured - Added by Reymes 3/7/26
  "NCY": 0.030, // Northern Cyprus - estimated - Added by Reymes 3/7/26

  // ── NORTH AMERICA & CARIBBEAN: high-income / not in PIP ─────────────────
  "ATG": 0.010, "BHS": 0.010, "BRB": 0.010, "CAN": 0.005,
  "CUB": 0.018, // closed economy
  "DMA": 0.015, "GRD": 0.020, "KNA": 0.015, "LCA": 0.018,
  "PRI": 0.012, // US territory, not in PIP - Added by Reymes 3/7/26
  "TTO": 0.015, "USA": 0.012, "VCT": 0.022,

  // ── OCEANIA: high-income / micro-states not in PIP ───────────────────────
  "AUS": 0.005, "NZL": 0.005,
  "FSM": 0.041, // too small for PIP
  "KIR": 0.141, // too small for PIP
  "MHL": 0.060, // too small for PIP
  "NRU": 0.010, // too small for PIP
  "PLW": 0.015, // too small for PIP
  "TON": 0.034, // limited PIP coverage
  "TUV": 0.060, // too small for PIP
  "WSM": 0.024, // limited PIP coverage
};

export function getInternationalRateMetadata() {
  return {
    line: INTERNATIONAL_RATE_POVERTY_LINE,
    year: INTERNATIONAL_RATE_YEAR,
    source: "World Bank PIP",
    description: `Percentage of population living below $${INTERNATIONAL_RATE_POVERTY_LINE}/day (2017 PPP)`,
  };
}
