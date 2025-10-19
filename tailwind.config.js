// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  important: true, // Thêm !important cho mọi class Tailwind
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      fontWeight: {
        black: "900",
      },
      maxWidth: {
        '6.5xl': '76rem', // ~1216px
      },
    },
  },
  plugins: [],
};
