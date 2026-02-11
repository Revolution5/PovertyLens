// Marisol Morales code created for dark mode feature on 2/9/2026
// This file configures Tailwind CSS to enable dark mode and defines your custom colors

/** @type {import('tailwindcss').Config} */
module.exports = {
  
  darkMode: 'class', // This allows dark: prefixes to work (dark:bg-gray-900, etc.)
 
  
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom brand colors are defined here
      colors: {
        cyan: {
          DEFAULT: '#8CE4FF',
          light: '#9DE9FF',
          dark: '#6DD5FF',
        },
        yellow: {
          DEFAULT: '#FEEE91',
          light: '#FFF4B0',
          dark: '#F5E080',
        },
        orange: {
          DEFAULT: '#FFA239',
          light: '#FFB660',
          dark: '#FF8E1A',
        },
        red: {
          DEFAULT: '#FF5656',
          light: '#FF7676',
          dark: '#FF3838',
        },
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, rgba(140, 228, 255, 0.1) 0%, rgba(254, 238, 145, 0.1) 100%)',
        'gradient-cyan-yellow': 'linear-gradient(135deg, #8CE4FF 0%, #FEEE91 100%)',
        'gradient-orange-red': 'linear-gradient(135deg, #FFA239 0%, #FF5656 100%)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
};