/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // MỚI: Cài đặt Titillium Web làm font mặc định cho toàn hệ thống
      fontFamily: {
        sans: ['"Titillium Web"', "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f6f8fa",
          100: "#afb8c1",
          500: "#0969da",
          600: "#0550ae",
          700: "#013d8d",
          900: "#0a3069",
        },
        // MỚI: GitHub Danger Palette
        danger: {
          50: "#fff8f7",
          100: "#ffebe9",
          500: "#cf222e",
          600: "#a40e26",
        },
        border: "#d0d7de",
        background: "#ffffff",
        surface: "#ffffff",
        canvas: "#f6f8fa",
      },
    },
  },
  plugins: [],
};
