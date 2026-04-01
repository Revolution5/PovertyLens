// Marisol Morales Code 1/9/2026 for dark mode use case
// UPDATED VERSION - Fixes issue where navbar stays dark

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Contrast = 'normal' | 'high'; //Modified for High contrast mode added by Damon 3/4/2026
const TEXT_SCALE_OPTIONS = [1, 1.15, 1.3, 1.4] as const;

interface ThemeContextType {
  theme: Theme;
  contrast: Contrast; //Modified for High contrast mode added by Damon 3/4/2026
  simpleUI: boolean; // Added by Reymes 3/24/2026 - Simple UI mode for reduced overstimulation
  textScale: number; // Added by Damon 4/1/2026 - global text scaling preference
  toggleTheme: () => void;
  toggleContrast: () => void; //Modified for High contrast mode added by Damon 3/4/2026
  toggleSimpleUI: () => void; // Added by Reymes 3/24/2026 - Simple UI mode for reduced overstimulation
  setTextScale: (scale: number) => void; // Added by Damon 4/1/2026 - set exact text scale

}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [contrast, setContrast] = useState<Contrast>('normal'); //Modified for High contrast mode added by Damon 3/4/2026
  const [simpleUI, setSimpleUI] = useState<boolean>(false); // Added by Reymes 3/24/2026 - Simple UI mode
  const [textScale, setTextScaleState] = useState<number>(1); // Added by Damon 4/1/2026 - default 100%

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedContrast = localStorage.getItem('contrast') as Contrast; //Modified for High contrast mode added by Damon 3/4/2026
    const savedSimpleUI = localStorage.getItem('simpleUI'); // Added by Reymes 3/24/2026
    const savedTextScaleRaw = localStorage.getItem('textScale'); // Added by Damon 4/1/2026
    const savedTextScale = savedTextScaleRaw ? Number(savedTextScaleRaw) : null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
     //START Modified for High contrast mode added by Damon 3/4/2026
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    if (savedContrast) {
      setContrast(savedContrast);
      //END Modified for High contrast mode added by Damon 3/4/2026
    }

    // Added by Reymes 3/24/2026 - restore simple UI setting
    if (savedSimpleUI === 'true') {
      setSimpleUI(true);
    }

    // Added by Damon 4/1/2026 - restore text scale setting if valid
    if (savedTextScale && TEXT_SCALE_OPTIONS.includes(savedTextScale as (typeof TEXT_SCALE_OPTIONS)[number])) {
      setTextScaleState(savedTextScale);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme and contrast classes
    root.classList.remove('light', 'dark', 'normal-contrast', 'high-contrast'); //Modified for High contrast mode added by Damon 3/4/2026
    
    // Add the current theme and contrast classes
    root.classList.add(theme, `${contrast}-contrast`); //Modified for High contrast mode added by Damon 3/4/2026
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('contrast', contrast); //Modified for High contrast mode added by Damon 3/4/2026
    
    /* Modified for High contrast mode added by Damon 3/4/2026 */
    console.log('Theme changed to:', theme, 'Contrast:', contrast);
  }, [theme, contrast]);

  // Added by Reymes 3/24/2026 - Apply/remove simple-ui class based on simpleUI state
  useEffect(() => {
    const root = document.documentElement;
    if (simpleUI) {
      root.classList.add('simple-ui');
    } else {
      root.classList.remove('simple-ui');
    }
    localStorage.setItem('simpleUI', String(simpleUI));
  }, [simpleUI]);

  // Added by Damon 4/1/2026 - apply and persist text scaling globally via root font-size
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${textScale * 100}%`;
    localStorage.setItem('textScale', String(textScale));
  }, [textScale]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Toggling theme from', prev, 'to', newTheme);
      return newTheme;
    });
  };

   //START Modified for High contrast mode added by Damon 3/4/2026
  const toggleContrast = () => {
    setContrast(prev => {
      const newContrast = prev === 'normal' ? 'high' : 'normal';
      console.log('Toggling contrast from', prev, 'to', newContrast);
      return newContrast;
    });
  };
  //END Modified for High contrast mode added by Damon 3/4/2026

  // Added by Reymes 3/24/2026 - Toggle simple UI mode
  const toggleSimpleUI = () => {
    setSimpleUI(prev => !prev);
  };

  const setTextScale = (scale: number) => {
    if (TEXT_SCALE_OPTIONS.includes(scale as (typeof TEXT_SCALE_OPTIONS)[number])) {
      setTextScaleState(scale);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, contrast, simpleUI, textScale, toggleTheme, toggleContrast, toggleSimpleUI, setTextScale }}> {/* Modified for High contrast mode added by Damon 3/4/2026 */}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}