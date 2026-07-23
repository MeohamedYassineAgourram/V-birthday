/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#EDEFF3",
        muted: "rgba(237,239,243,0.55)",
        space: "#03040A",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "system-ui", "Arial", "sans-serif"],
      },
      letterSpacing: { widest2: "0.35em" },
      backdropBlur: { xl2: "28px" },
    },
  },
  plugins: [],
};
