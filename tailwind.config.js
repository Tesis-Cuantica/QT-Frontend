/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        qt: {
          bg: "#0c0c0d",
          panel: "#111114",
          border: "#1f2430",
          primary: "#7c3aed",
          accent: "#22d3ee",
          text: "#e5e7eb",
          muted: "#9ca3af",
          success: "#10b981",
          danger: "#ef4444",
          warn: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
