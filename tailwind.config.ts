import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        "primary-hover": "#4F46E5",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        "text-primary": "#0A0A0A",
        "text-secondary": "#6B6B6B",
        border: "#E8E8EC"
      },
      fontFamily: {
        heading: ['"General Sans"', "Inter", "Arial", "sans-serif"],
        body: ['"DM Sans"', "Inter", "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"]
      },
      boxShadow: {
        lift: "0 10px 24px rgba(10, 10, 10, 0.06)",
        glow: "0 0 0 4px rgba(99, 102, 241, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
