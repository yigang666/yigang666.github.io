/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'Monaco', '"Courier New"', 'monospace'],
      },
      colors: {
        terminal: {
          black: '#000000',
          green: '#4ade80',
          cyan: '#22d3ee',
          amber: '#fbbf24',
          red: '#f87171',
          white: '#f3f4f6',
          gray: '#6b7280',
          'gray-950': '#030712',
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
