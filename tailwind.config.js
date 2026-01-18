/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Goalmax brand colors - dark, serious, system-like
        goalmax: {
          bg: '#0a0a0b',
          surface: '#141416',
          border: '#27272a',
          muted: '#52525b',
          text: '#fafafa',
          'text-secondary': '#a1a1aa',
          accent: '#22c55e', // Success/on-track green
          warning: '#f59e0b',
          error: '#ef4444',
          deviation: '#ef4444', // "Deviation detected"
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
