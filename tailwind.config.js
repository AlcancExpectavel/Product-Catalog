/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === CORES DA MARCA ===
        // Substitui estas cores pelas cores oficiais da tua marca
        brand: {
          50:  "#e6f4ff",
          100: "#cce7ff",
          200: "#99cfff",
          400: "#0099cc",
          500: "#0077b8",
          600: "#0059a0",
          700: "#003f85",
          800: "#002d6b",
          900: "#001d4a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
