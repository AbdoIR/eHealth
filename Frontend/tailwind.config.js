import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/**/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Clinical accent palette — driven by CSS variables so the accent picker works.
        // Tailwind reads these as rgb(var(--c-XXX) / <opacity>).
        clinical: {
          50: "rgb(var(--c-50)  / <alpha-value>)",
          100: "rgb(var(--c-100) / <alpha-value>)",
          200: "rgb(var(--c-200) / <alpha-value>)",
          300: "rgb(var(--c-300) / <alpha-value>)",
          400: "rgb(var(--c-400) / <alpha-value>)",
          500: "rgb(var(--c-500) / <alpha-value>)",
          600: "rgb(var(--c-600) / <alpha-value>)",
          700: "rgb(var(--c-700) / <alpha-value>)",
          800: "rgb(var(--c-800) / <alpha-value>)",
          900: "rgb(var(--c-900) / <alpha-value>)",
          950: "rgb(var(--c-950) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    heroui({
      layout: {
        radius: {
          small: "6px", // Bubbly modern radius
          medium: "12px", // Modern default for inputs/buttons
          large: "16px", // Cards
        },
        borderWidth: {
          small: "1px",
          medium: "1.5px", // slightly thicker default borders for modern flat design
          large: "2px",
        },
      },
    }),
  ],
};
