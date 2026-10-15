/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Required brand palette
        gt: {
          bg: '#090B0A',
          secondary: '#101310',
          card: '#151915',
          elevated: '#1B211B',
          accent: '#B7FF5A',
          'accent-hover': '#CAFF8C',
          'accent-dim': 'rgba(183, 255, 90, 0.12)',
          'accent-border': 'rgba(183, 255, 90, 0.28)',
          text: '#F4F7F2',
          'text-secondary': '#A1AAA0',
          'text-muted': '#70796F',
          border: '#282F28',
          'border-light': '#384238',
          error: '#EF4444',
          'error-muted': 'rgba(239, 68, 68, 0.15)',
          success: '#B7FF5A',
        },
        // Mapped brand colors for existing classes
        brand: {
          50: '#f4fbe9',
          100: '#e5f8cc',
          200: '#cefa99',
          300: '#b7ff5a',
          400: '#a3f044',
          500: '#8edb2f',
          600: '#B7FF5A', // Neon primary accent
          700: '#CAFF8C', // Hover accent
          800: '#1b2612',
          900: '#111a0c',
          950: '#090d06',
        },
        // Fine-tuned dark slate palette mapping to GitTogether dark surfaces
        slate: {
          950: '#090B0A', // Primary background
          900: '#101310', // Secondary background
          850: '#151915', // Card surfaces
          800: '#1B211B', // Elevated surfaces
          700: '#282F28', // Border
          600: '#384238', // Lighter border
          500: '#70796F', // Muted text
          400: '#A1AAA0', // Secondary text
          300: '#C2CCC0',
          200: '#DDE5DC',
          100: '#EEF2EC',
          50: '#F4F7F2',  // Primary text
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        elevated: '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
        'accent-glow': '0 0 20px rgba(183, 255, 90, 0.18)',
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
