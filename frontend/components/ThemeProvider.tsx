// Marisol Morales Code 1/9/2026 for dark mode use case
// UPDATED VERSION - Fixes issue where navbar stays dark

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
 /* Modified for High contrast mode added by Damon 3/4/2026 */
type Contrast = 'normal' | 'high';

interface ThemeContextType {
  theme: Theme;
   /* Modified for High contrast mode added by Damon 3/4/2026 */
  contrast: Contrast;
  toggleTheme: () => void;
   /* Modified for High contrast mode added by Damon 3/4/2026 */
  toggleContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
   /* Modified for High contrast mode added by Damon 3/4/2026 */
  const [contrast, setContrast] = useState<Contrast>('normal');

 
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
     /* Modified for High contrast mode added by Damon 3/4/2026 */
    const savedContrast = localStorage.getItem('contrast') as Contrast;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
     /* Modified for High contrast mode added by Damon 3/4/2026 */
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    if (savedContrast) {
      setContrast(savedContrast);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme and contrast classes
    /* Modified for High contrast mode added by Damon 3/4/2026 */
    root.classList.remove('light', 'dark', 'normal-contrast', 'high-contrast');
    
    // Add the current theme and contrast classes
    root.classList.add(theme, `${contrast}-contrast`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    localStorage.setItem('contrast', contrast);
    
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

   /* Modified for High contrast mode added by Damon 3/4/2026 */
  const toggleContrast = () => {
    setContrast(prev => {
      const newContrast = prev === 'normal' ? 'high' : 'normal';
      console.log('Toggling contrast from', prev, 'to', newContrast);
      return newContrast;
    });
  };

  return (
     /* Modified for High contrast mode added by Damon 3/4/2026 */
    <ThemeContext.Provider value={{ theme, contrast, toggleTheme, toggleContrast }}>
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