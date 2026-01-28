/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          offwhite: "var(--bg-site)",
          beige: "var(--bg-secondary)",
          charcoal: "var(--text-main)", // Updated to Deep Green
          light: "var(--text-on-dark)", // Added for consistent light text
          burgundy: "#4D1330", // New Brand Color
          gold: "var(--accent-gold)", // Metallic gold matching logo
          "gold-light": "#E5C860", // Lighter variant of metallic gold
          footer: "var(--bg-footer)",
        },
      },
      fontFamily: {
        alexandria: ["Alexandria", "sans-serif"],
        serif: ["Alexandria", "sans-serif"], // Aligning with design
        sans: ["Alexandria", "sans-serif"],
      },
      letterSpacing: {
        widest: ".2em",
      },
    },
  },
  plugins: [],
};
