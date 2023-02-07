/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        main_orange: "#FB8500",
        main_yellow: "#FFB703",
        main_dark_blue: "#023047",
        main_mid_blue: "#219EBC",
        main_light_blue: "#8ECAE6",
      },
    },
  },
  plugins: [],
};
