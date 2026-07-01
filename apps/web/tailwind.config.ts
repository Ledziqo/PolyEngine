import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#05070b",
        panel: "#0b1020",
        cyanx: "#16d9e3",
        violetx: "#7c3aed",
        greenx: "#22c55e",
        amberx: "#f59e0b",
        redx: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 60px rgba(22, 217, 227, 0.18)",
        violet: "0 0 70px rgba(124, 58, 237, 0.20)"
      }
    }
  },
  plugins: []
};

export default config;
