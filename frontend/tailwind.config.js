/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C3FCF",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        background: "#F9FAFB",
        dark: "#1E1B4B",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
