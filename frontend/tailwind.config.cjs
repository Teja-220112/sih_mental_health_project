/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B132B',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155'
        },
        teal: {
          950: '#042F2E',
          900: '#134E4A',
          800: '#115E59',
          700: '#0F766E',
          600: '#0D9488',
          500: '#14B8A6',
          100: '#CCFBF1',
          50: '#F0FDFA'
        },
        accent: {
          blue: '#2563EB',
          hover: '#1D4ED8'
        },
        risk: {
          low: '#16A34A',
          moderate: '#D97706',
          high: '#EA580C',
          critical: '#DC2626'
        }
      }
    },
  },
  plugins: [],
}
