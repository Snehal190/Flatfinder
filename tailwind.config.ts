import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#fdf8f3",
        "bg-2": "#f5f0eb",
        accent: "#e4a4bd",
        ink: "#262626",
      },
      fontFamily: {
        sans: ["var(--font-spartan)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        house: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        reveal: "1000ms",
      },
      letterSpacing: {
        label: "0.4em",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(5%)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
