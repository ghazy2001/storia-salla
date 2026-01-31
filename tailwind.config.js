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
        sans: ["Cairo", "sans-serif"],
        serif: ["Cairo", "sans-serif"],
        cairo: ["Cairo", "sans-serif"], // Keeping this alias just in case
      },
      letterSpacing: {
        widest: ".2em",
      },
      animation: {
        breathe: "breathe 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.1", transform: "scale(1.4)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
