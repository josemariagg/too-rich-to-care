/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: {
          dark: '#0D0F1A',
          deeper: '#131623',
          hover: '#1C1F2E',
        },
        accent: {
          yellow: '#FACC15',
        },
      },
      dropShadow: {
        logo: '0 4px 20px rgba(255, 186, 0, 0.5)',
      },
    },
  },
  plugins: [],
  
}
