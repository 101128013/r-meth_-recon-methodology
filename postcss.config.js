export default {
  plugins: {
    // Tailwind v4 introduced a move of the PostCSS plugin to a
    // separate package (`@tailwindcss/postcss`). Use that here so
    // Vite + PostCSS will correctly transform Tailwind directives.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
