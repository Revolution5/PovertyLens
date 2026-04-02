// Marisol Morales Code 1/9/2026 for dark mode use case
// UPDATED VERSION - Fixes issue where navbar stays dark

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Contrast = 'normal' | 'high'; //Modified for High contrast mode added by Damon 3/4/2026
const TEXT_SCALE_OPTIONS = [1, 1.15, 1.3, 1.4] as const;
//START Added by Damon 4/1/2026 - text scaling options for accessibility, defined as a tuple for type safety
const INLINE_FONT_SIZE_SELECTOR = '[style*="font-size"]';

function scaleFontSizeValue(fontSize: string, scale: number): string | null {
  const trimmedFontSize = fontSize.trim();
  const match = trimmedFontSize.match(/^(-?\d*\.?\d+)(px|rem|em|%)$/);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[1]);
  const unit = match[2];
  return `${numericValue * scale}${unit}`;
}

function applyInlineTextScale(rootNode: ParentNode, scale: number) {
  const scopedElements: HTMLElement[] = [];

  if (rootNode instanceof HTMLElement && rootNode.matches(INLINE_FONT_SIZE_SELECTOR)) {
    scopedElements.push(rootNode);
  }

  if ('querySelectorAll' in rootNode) {
    scopedElements.push(...Array.from(rootNode.querySelectorAll<HTMLElement>(INLINE_FONT_SIZE_SELECTOR)));
  }

  scopedElements.forEach((element) => {
    const currentFontSize = element.style.fontSize.trim();
    if (!currentFontSize && !element.dataset.baseFontSize) {
      return;
    }

    const baseFontSize = element.dataset.baseFontSize ?? currentFontSize;
    if (!element.dataset.baseFontSize) {
      element.dataset.baseFontSize = baseFontSize;
    }

    const scaledFontSize = scale === 1 ? baseFontSize : scaleFontSizeValue(baseFontSize, scale);
    if (scaledFontSize && element.style.fontSize !== scaledFontSize) {
      element.style.fontSize = scaledFontSize;
    }
  });
}
//END Added by Damon 4/1/2026 - text scaling options for accessibility, defined as a tuple for type safety

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

  // Added by Damon 4/1/2026 - apply and persist text-only scaling via CSS variables and inline font sizes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', String(textScale));
    localStorage.setItem('textScale', String(textScale));

    //START Aded by Damon 4/1/2026 - apply text scaling to all elements with inline font sizes, and set up MutationObserver to handle dynamically added/changed elements
    applyInlineTextScale(document.body, textScale);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              applyInlineTextScale(node, textScale);
            }
          });
        }

        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          applyInlineTextScale(mutation.target, textScale);
        }
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => {
      observer.disconnect();
    };
  }, [textScale]);
    //END Aded by Damon 4/1/2026 - apply text scaling to all elements with inline font sizes, and set up MutationObserver to handle dynamically added/changed elements

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