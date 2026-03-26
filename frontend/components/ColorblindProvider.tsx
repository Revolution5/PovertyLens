// ColorblindProvider.tsx - Added by Reymes 3/24/2026
// Global context for the active colorblind mode.
//
// How it works (overlay approach — no existing components are modified):
//   1. Applies a CSS class  (e.g. `cb-deuteranopia`) to <html>.
//   2. globals.css houses CSS-variable overrides for each class so brand
//      colors shift automatically as a passive overlay across all UI.
//   3. StatisticsMapLeaflet reads `colorblindMode` directly from this context
//      and swaps its JS-generated map colors to the accessible palette.
//   4. The setting is persisted in localStorage so it survives page reloads.

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ColorblindMode } from './colorblindPalette';

interface ColorblindContextType {
  colorblindMode: ColorblindMode;
  setColorblindMode: (mode: ColorblindMode) => void;
}

const ColorblindContext = createContext<ColorblindContextType | undefined>(undefined);

const VALID_MODES: ColorblindMode[] = [
  'none',
  'deuteranopia',
  'protanopia',
  'tritanopia',
  'achromatopsia',
];

export function ColorblindProvider({ children }: { children: React.ReactNode }) {
  const [colorblindMode, setColorblindModeState] = useState<ColorblindMode>('none');

  // Restore persisted preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('colorblindMode') as ColorblindMode;
    if (saved && VALID_MODES.includes(saved)) {
      setColorblindModeState(saved);
    }
  }, []);

  // Apply the CSS class to <html> and persist whenever the mode changes
  useEffect(() => {
    const root = document.documentElement;
    // Remove any previous colorblind class
    VALID_MODES.forEach((m) => root.classList.remove(`cb-${m}`));
    if (colorblindMode !== 'none') {
      root.classList.add(`cb-${colorblindMode}`);
    }
    localStorage.setItem('colorblindMode', colorblindMode);
  }, [colorblindMode]);

  const setColorblindMode = (mode: ColorblindMode) => setColorblindModeState(mode);

  return (
    <ColorblindContext.Provider value={{ colorblindMode, setColorblindMode }}>
      {children}
    </ColorblindContext.Provider>
  );
}

export function useColorblind() {
  const context = useContext(ColorblindContext);
  if (!context) throw new Error('useColorblind must be used within ColorblindProvider');
  return context;
}
