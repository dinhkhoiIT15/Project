/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // GitHub Primer Color System
        primary: {
          50: "#f6f8fa", // Header/Sidebar bg
          100: "#afb8c1", // Muted borders
          500: "#0969da", // GitHub Blue (Links/Buttons)
          600: "#0550ae", // Darker blue
          700: "#013d8d",
          900: "#0a3069",
        },
        border: "#d0d7de", // Standard GitHub border
        background: "#ffffff",
        surface: "#ffffff",
        canvas: "#f6f8fa", // Subtle background
      },
    },
  },
  plugins: [],
};
