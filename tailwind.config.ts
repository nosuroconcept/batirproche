import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#1C1F26",
        blueprint: "#2C4A6E",
        blueprintLight: "#3E6690",
        amber: "#E8A23D",
        amberDark: "#C4821F",
        ivory: "#F5F3EE",
        concrete: "#8B8A85",
        concreteLight: "#D8D6CE",
        success: "#4A7856",
        danger: "#B5473A",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        blueprintGrid:
          "linear-gradient(rgba(245,243,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,238,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};
export default config;
