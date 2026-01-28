/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          offwhite: "#FDFCF8",
          beige: "#F5F5F0",
          charcoal: "#1A1A1A",
          gold: "#C5A059",
          "gold-light": "#D4AF37",
        },
      },
      fontFamily: {
        serif: ["Amiri", "serif"],
        sans: ["Cairo", "sans-serif"],
      },
      letterSpacing: {
        widest: ".2em",
      },
    },
  },
  plugins: [],
};
