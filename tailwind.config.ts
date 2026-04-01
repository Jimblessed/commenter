import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6C5CE7",
          light: "#A29BFE",
          dark: "#5A4BD1",
        },
      },
    },
  },
  plugins: [],
};
export default config;
