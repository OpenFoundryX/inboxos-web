import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F3F1EA",
        card: "#FCFBF7",
        ink: "#1A1D26",
        muted: "#6B7280",
        accent: "#F0562D",
        "accent-dark": "#D8451F",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};

export default config;
