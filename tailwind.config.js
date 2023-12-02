const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{html,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".center-screen": {
          height: "100vh",
          width: "100%",
          display: "grid",
          placeItems: "center",
        },
      });
    }),
  ],
};
