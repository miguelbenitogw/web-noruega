/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E73BE',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#1E73BE', // Global Working Blue
          700: '#155a96',
          800: '#0e416e',
          900: '#062A6A', // Global Working Navy
        },
        cta: {
          DEFAULT: '#DB532E', // Global Working Orange
          600: '#c24222',
        },
        navy: '#062A6A',
        surface: '#F8FAFC',
        ink: '#1E293B',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
