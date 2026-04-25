// Reymes - Historical World Bank poverty lines by year for the timeline
// Based on World Bank PIP (Poverty and Inequality Platform) methodology
// Each line reflects the PPP adjustment used for that year's data

export const HISTORICAL_POVERTY_LINES: Record<number, { line: number; ppp: string; description: string }> = {
  1990: { 
    line: 1.08, 
    ppp: "1993 PPP",
    description: "Historical baseline - 1993 PPP conversion"
  },
  1995: { 
    line: 1.08, 
    ppp: "1993 PPP",
    description: "1993 PPP conversion rates"
  },
  2000: { 
    line: 1.08, 
    ppp: "1993 PPP",
    description: "1993 PPP conversion rates"
  },
  2005: { 
    line: 1.25, 
    ppp: "1993 PPP",
    description: "Adjusted to 1993 PPP standard"
  },
  2010: { 
    line: 1.25, 
    ppp: "2005 PPP",
    description: "Updated to 2005 PPP conversion rates"
  },
  2015: { 
    line: 1.90, 
    ppp: "2011 PPP",
    description: "Updated to 2011 PPP conversion rates"
  },
  2020: { 
    line: 2.15, 
    ppp: "2017 PPP",
    description: "Current international standard - 2017 PPP"
  },
};

/**
 * Get the poverty line for a specific year
 * @param year The year to get the poverty line for
 * @returns The poverty line for that year, or 2.15 as default if year not found
 */
export function getPovertyLineForYear(year: number): number {
  const lineData = HISTORICAL_POVERTY_LINES[year];
  if (lineData) {
    return lineData.line;
  }
  
  // Find the closest year if exact year not found
  const sortedYears = Object.keys(HISTORICAL_POVERTY_LINES)
    .map(y => parseInt(y, 10))
    .sort((a, b) => a - b);
  
  if (year < sortedYears[0]) {
    return HISTORICAL_POVERTY_LINES[sortedYears[0]].line;
  }
  
  if (year > sortedYears[sortedYears.length - 1]) {
    return HISTORICAL_POVERTY_LINES[sortedYears[sortedYears.length - 1]].line;
  }
  
  // Find the closest year
  for (let i = 0; i < sortedYears.length - 1; i++) {
    if (year >= sortedYears[i] && year < sortedYears[i + 1]) {
      // Return the earlier year's line
      return HISTORICAL_POVERTY_LINES[sortedYears[i]].line;
    }
  }
  
  return 2.15; // Fallback
}

/**
 * Get the poverty line metadata for a specific year
 * @param year The year to get the poverty line metadata for
 * @returns The poverty line metadata for that year
 */
export function getPovertyLineMetadata(year: number) {
  const lineData = HISTORICAL_POVERTY_LINES[year];
  if (lineData) {
    return lineData;
  }
  
  // Find the closest year if exact year not found
  const sortedYears = Object.keys(HISTORICAL_POVERTY_LINES)
    .map(y => parseInt(y, 10))
    .sort((a, b) => a - b);
  
  if (year < sortedYears[0]) {
    return HISTORICAL_POVERTY_LINES[sortedYears[0]];
  }
  
  if (year > sortedYears[sortedYears.length - 1]) {
    return HISTORICAL_POVERTY_LINES[sortedYears[sortedYears.length - 1]];
  }
  
  // Find the closest year
  for (let i = 0; i < sortedYears.length - 1; i++) {
    if (year >= sortedYears[i] && year < sortedYears[i + 1]) {
      return HISTORICAL_POVERTY_LINES[sortedYears[i]];
    }
  }
  
  return {
    line: 2.15,
    ppp: "2017 PPP",
    description: "Default poverty line"
  };
}
