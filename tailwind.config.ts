import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14110f", surface: "#1b1714", card: "#231e1a", line: "#332b25",
        muted: "#8f8780", soft: "#c4bcb4",
        brand: { DEFAULT: "#ff8a3d", 400: "#ffb27a", 600: "#f06a1a", 700: "#c4520f" },
        wa: "#25d366",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      backgroundImage: { "brand-grad": "linear-gradient(135deg,#ffb27a 0%,#ff6a2b 100%)" },
    },
  },
  plugins: [],
};
export default config;
