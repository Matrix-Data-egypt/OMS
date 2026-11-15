/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC2626',
          darkRed: '#B91C1C',
          lightRed: '#FEE2E2',
          black: '#171717',
          dark: '#0F0F0F',
          card: '#1F1F1F',
          gray: '#737373',
          lightGray: '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
