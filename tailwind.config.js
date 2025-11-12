/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",

        border: "rgb(var(--border) / <alpha-value>)",
        "card-border": "rgb(var(--card-border) / <alpha-value>)",

        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-inverted": "rgb(var(--text-inverted) / <alpha-value>)",
        "text-muted-inverted":
          "rgb(var(--text-muted-inverted) / <alpha-value>)",
      },
      gradientColorStops: {
        "accent-start": "rgb(var(--accent-start) / <alpha-value>)",
        "accent-end": "rgb(var(--accent-end) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
