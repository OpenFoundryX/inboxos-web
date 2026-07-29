import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F8F7",
        card: "#FFFFFF",
        ink: "#16211C",
        accent: "#1F6F5C",
        "accent-dark": "#17564A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Marketing headings only. The app stays on Inter — a serif in a dense
        // dashboard costs more legibility than it buys character.
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
      },
      borderRadius: { "2xl": "1rem" },
    },
  },
  plugins: [],
};

export default config;
