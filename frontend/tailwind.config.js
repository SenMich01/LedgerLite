/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C3FCF',
          light: '#8B5CF6',
          dark: '#5B21B6',
        },
        sidebar: '#1E1B4B',
      },
    },
  },
  plugins: [],
}
