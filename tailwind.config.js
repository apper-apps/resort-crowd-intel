/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        accent: '#228B22',
        surface: '#FFF8DC',
        background: '#FAF0E6',
        success: '#32CD32',
        warning: '#FF8C00',
        error: '#DC143C',
        info: '#4682B4'
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}