/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1120',
          800: '#111827',
          700: '#162032',
          600: '#1C2A3A',
          500: '#1C3A5C',
        },
        brand: {
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
          green:  '#10B981',
          red:    '#EF4444',
          orange: '#F97316',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
