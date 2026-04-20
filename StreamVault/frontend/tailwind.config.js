/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',       // ← was {ts,tsx}, now {js,jsx}
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Outfit', 'sans-serif'],
      },
      colors: {
        accent: '#6C63FF',
        'accent-warm': '#FF6B6B',
      },
      screens: {
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}