/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-primary': '#8b5cf6',
        'accent-secondary': '#ec4899',
        'bg-card': 'rgba(23, 23, 26, 0.7)',
        'text-muted': '#94a3b8',
        'border-glass': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}

