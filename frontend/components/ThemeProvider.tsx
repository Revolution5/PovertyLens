// Marisol Morales Code 1/9/2026 for dark mode use case
// UPDATED VERSION - Fixes issue where navbar stays dark

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Contrast = 'normal' | 'high'; //Modified for High contrast mode added by Damon 3/4/2026

interface ThemeContextType {
  theme: Theme;
  contrast: Contrast; //Modified for High contrast mode added by Damon 3/4/2026
  toggleTheme: () => void;
  toggleContrast: () => void; //Modified for High contrast mode added by Damon 3/4/2026

}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [contrast, setContrast] = useState<Contrast>('normal'); //Modified for High contrast mode added by Damon 3/4/2026

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedContrast = localStorage.getItem('contrast') as Contrast; //Modified for High contrast mode added by Damon 3/4/2026
    
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

  return (
    <ThemeContext.Provider value={{ theme, contrast, toggleTheme, toggleContrast }}> {/* Modified for High contrast mode added by Damon 3/4/2026 */}
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