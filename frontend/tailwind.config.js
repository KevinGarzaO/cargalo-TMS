/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A8FBF',
          dark: '#0E6E97',
          soft: '#E6F2F7',
        },
        secondary: {
          DEFAULT: '#4CB89C',
          mint: '#66D6B5',
        },
        ink: {
          900: '#0E2A3A',
          700: '#2C4654',
          500: '#5C7480',
          400: '#8497A0',
          300: '#B6C4CB',
          200: '#D9E2E6',
          100: '#ECF1F3',
          50:  '#F4F7F9',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
