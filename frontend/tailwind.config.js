/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Scan all Vue and JS/TS files in src
  ],
  theme: {
    extend: {
      // You can extend aletaoblind's default theme here
      // For example, adding custom colors, fonts, etc.
      colors: {
        'brand-primary': '#FF9900', // Example primary color
        'brand-secondary': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: using Inter font
      },
    },
  },
  plugins: [],
} 