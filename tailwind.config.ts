import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kick: {
          DEFAULT: "#53FC18",
          dark: "#00E701",
        },
        noke: {
          purple: "#6C3BF1",
          dark: "#0D0D1A",
          card: "#151528",
          muted: "#8B8BA7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
