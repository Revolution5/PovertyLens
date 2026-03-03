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

export function getInternationalRateMetadata() {
  return {
    line: INTERNATIONAL_RATE_POVERTY_LINE,
    year: INTERNATIONAL_RATE_YEAR,
    source: "World Bank PIP",
    description: `Percentage of population living below $${INTERNATIONAL_RATE_POVERTY_LINE}/day (2017 PPP)`,
  };
}
