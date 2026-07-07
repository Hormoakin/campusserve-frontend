/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F3864",
          light: "#2C4F9E",
          dark: "#162850",
        },
        secondary: {
          DEFAULT: "#1ABC9C",
          light: "#22D3B8",
          dark: "#16A085",
        },
      },
    },
  },
  plugins: [],
};
