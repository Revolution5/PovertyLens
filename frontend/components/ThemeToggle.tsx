// Marisol Morales code 1/9/2026 for dark mode use case

'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  showContrast?: boolean;
}

export function ThemeToggle({ showContrast = true }: ThemeToggleProps) {
  const { theme, contrast, toggleTheme, toggleContrast } = useTheme(); //Modified for High contrast mode added by Damon 3/4/2026
  
  return (
    <div className="flex items-center gap-2">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>
       {/* START Modified for High contrast mode added by Damon 3/4/2026 */}
      {/* High contrast toggle switch - only show when logged in */}
      {showContrast && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 high-contrast-label">High Contrast</span>
          <button
            onClick={toggleContrast}
            suppressHydrationWarning
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 high-contrast:focus:ring-black dark:high-contrast:focus:ring-white ${
              contrast === 'high'
                ? 'bg-black dark:bg-white'
                : 'bg-gray-200 dark:bg-gray-700 high-contrast:bg-white dark:high-contrast:bg-black'
            }`}
            aria-label="Toggle high contrast mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                contrast === 'high'
                  ? 'bg-white dark:bg-black translate-x-6'
                  : 'bg-gray-500 dark:bg-gray-400 high-contrast:bg-black dark:high-contrast:bg-white translate-x-1'
              }`}
            />
          </button>
        </div>
      )}
    </div>
    /* END Modified for High contrast mode added by Damon 3/4/2026 */
  );
}