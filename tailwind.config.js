/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        ayur: {
          dark: '#081C13',
          card: '#0D281C',
          moss: '#1B4D3E',
          forest: '#0F382C',
          gold: '#DFB15B',
          amber: '#D97706',
          cream: '#FAF7F2',
          sand: '#F3EFE6',
          border: '#23493C',
          lightBorder: '#E2D9CC'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Cinzel"', 'ui-serif', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
