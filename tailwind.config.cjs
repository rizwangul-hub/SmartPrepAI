/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // enable class‑based dark mode
  theme: {
    extend: {
      colors: {
        primary: "hsl(200, 80%, 50%)",
        secondary: "hsl(210, 30%, 20%)",
        accent: "hsl(160, 60%, 45%)",
        glass: "rgba(255,255,255,0.15)"
      },
      backdropBlur: {
        xs: "2px"
      },
      borderRadius: {
        xl: "1.5rem"
      }
    }
  },
  plugins: []
};
