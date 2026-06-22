import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx,json}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        reed: "#2f5d50",
        oasis: "#0f766e",
        clay: "#b65f4b",
        saffron: "#c78a19",
        skysoft: "#d9edf2",
      },
      boxShadow: {
        soft: "0 12px 34px rgba(31, 41, 51, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
        arabic: ["var(--font-amiri)", "Amiri", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
