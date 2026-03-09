/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        silver: {
          100: '#f5f5f7',
          200: '#e5e7eb',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
        },
        midnight: {
          DEFAULT: '#050510',
          light: '#0a0a20',
          dark: '#000000',
        }
      }
    },
  },
  plugins: [],
};
