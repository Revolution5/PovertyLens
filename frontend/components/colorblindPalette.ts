// colorblindPalette.ts - Added by Reymes 3/24/2026
// Colorblind-safe map color palettes inspired by video game accessibility modes
// Each palette replaces the red-green severity scale with a fully distinguishable
// alternative so that ALL poverty bands are visible regardless of color vision type.
//
// Palettes are purposefully helpful, NOT simulations.
// "none" = original default. All other modes swap to an accessible alternative.

export type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

export interface ColorblindModeInfo {
  label: string;
  description: string;
  /** Three preview swatches shown in the settings UI: [high-severity, mid, low-severity] */
  preview: [string, string, string];
}

export const COLORBLIND_MODES: Record<ColorblindMode, ColorblindModeInfo> = {
  none: {
    label: 'None',
    description: 'Standard red-to-green palette',
    preview: ['#8B0000', '#FFA500', '#90EE90'],
  },
  deuteranopia: {
    label: 'Deuteranopia',
    description: 'Red-green colorblindness (green-weak)',
    preview: ['#1155CC', '#FF8C00', '#F5EBC8'],
  },
  protanopia: {
    label: 'Protanopia',
    description: 'Red-green colorblindness (red-weak)',
    preview: ['#003366', '#FF9900', '#FFF5CC'],
  },
  tritanopia: {
    label: 'Tritanopia',
    description: 'Blue-yellow colorblindness',
    preview: ['#CC0000', '#339900', '#CCEEAA'],
  },
  achromatopsia: {
    label: 'Achromatopsia',
    description: 'No color vision (full grayscale)',
    preview: ['#0D0D0D', '#696969', '#E8E8E8'],
  },
};

// ---------------------------------------------------------------------------
// Internal palette table
// vhigh >40%  |  high 30-40%  |  mhigh 20-30%  |  mlow 10-20%  |  low 5-10%  |  vlow 0-5%
// nodata = tracked country with no available data
// untracked = country not in our tracking system at all
// ---------------------------------------------------------------------------
const PALETTES: Record<ColorblindMode, {
  vhigh: string; high: string; mhigh: string;
  mlow: string;  low: string;  vlow: string;
  nodata: string; untracked: string;
}> = {
  // Original default — unchanged from the existing map
  none: {
    vhigh: '#8B0000', high: '#DC143C', mhigh: '#FF6347',
    mlow:  '#FFA500', low:  '#FFD700', vlow:  '#90EE90',
    nodata: '#9370DB', untracked: '#E8E8E8',
  },

  // Deuteranopia: deep blue (worst) → sky-blue → amber → cream (best)
  // Deuteranopes lose the red-green axis but see blue and amber clearly.
  deuteranopia: {
    vhigh: '#0A2E6E', high: '#1155CC', mhigh: '#4DA6FF',
    mlow:  '#FF8C00', low:  '#FFD166', vlow:  '#F5EBC8',
    nodata: '#9933CC', untracked: '#D8D8D8',
  },

  // Protanopia: similar to deuteranopia but shifted warmer on the blue end
  protanopia: {
    vhigh: '#003366', high: '#0066CC', mhigh: '#3399FF',
    mlow:  '#FF9900', low:  '#FFCC44', vlow:  '#FFF5CC',
    nodata: '#8844AA', untracked: '#D8D8D8',
  },

  // Tritanopia: deep red (worst) → bright red → green (best)
  // Tritanopes cannot distinguish blue from yellow but see red and green fine.
  tritanopia: {
    vhigh: '#660000', high: '#CC0000', mhigh: '#FF4444',
    mlow:  '#339900', low:  '#66CC33', vlow:  '#CCEEAA',
    nodata: '#888888', untracked: '#E8E8E8',
  },

  // Achromatopsia: pure luminance step scale, no hue dependency at all
  achromatopsia: {
    vhigh: '#0D0D0D', high: '#3D3D3D', mhigh: '#6B6B6B',
    mlow:  '#969696', low:  '#C2C2C2', vlow:  '#E8E8E8',
    nodata: '#595959', untracked: '#F8F8F8',
  },
};

/**
 * Returns the colorblind-safe fill color for a given poverty rate and mode.
 * Drop-in replacement for the original `getPovertyColor()` in StatisticsMapLeaflet.
 */
export function getPovertyColorForMode(
  povertyRate: number | null | undefined,
  mode: ColorblindMode = 'none',
): string {
  const p = PALETTES[mode] ?? PALETTES.none;
  if (povertyRate === null || povertyRate === undefined) return p.untracked;
  if (povertyRate > 40) return p.vhigh;
  if (povertyRate > 30) return p.high;
  if (povertyRate > 20) return p.mhigh;
  if (povertyRate > 10) return p.mlow;
  if (povertyRate > 5)  return p.low;
  return p.vlow;
}

/** Returns the colorblind-safe color for tracked countries that have no data. */
export function getNoDataColorForMode(mode: ColorblindMode = 'none'): string {
  return (PALETTES[mode] ?? PALETTES.none).nodata;
}

/** Returns all 7 labeled legend entries with colorblind-safe colors for the given mode. */
export function getLegendEntriesForMode(mode: ColorblindMode = 'none') {
  const p = PALETTES[mode] ?? PALETTES.none;
  return [
    { color: p.vhigh,  label: '> 40%' },
    { color: p.high,   label: '30% - 40%' },
    { color: p.mhigh,  label: '20% - 30%' },
    { color: p.mlow,   label: '10% - 20%' },
    { color: p.low,    label: '5% - 10%' },
    { color: p.vlow,   label: '0% - 5%' },
    { color: p.nodata, label: 'Untracked, missing data' },
  ];
}
