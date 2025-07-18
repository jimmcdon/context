/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cursor-bg': '#1e1e1e',
        'cursor-sidebar': '#252526',
        'cursor-border': '#3e3e42',
        'cursor-accent': '#007acc',
        'cursor-text': '#cccccc',
        'cursor-text-muted': '#969696'
      }
    },
  },
  plugins: [],
}