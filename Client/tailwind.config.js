/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{html,js}",
    "./components/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        customDark: {
          500: "#020102",
        },
        customDark1: {
          500: "#121212",
        },
      },
    },
  },
  plugins: [],
};
