/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-red-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-amber-100',
    'text-red-600',
    'text-blue-600',
    'text-green-600',
    'text-amber-600'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#0891b2',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        dark: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
             '0%': { opacity: '0' },
             '100%': { opacity: '1' },
        },
        'slide-up': {
             '0%': { opacity: '0', transform: 'translateY(30px)' },
             '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(14, 116, 144, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 116, 144, 0.1) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(circle at top left, theme("colors.primary.100") 0%, theme("colors.white") 40%)',
        'card-gradient': 'linear-gradient(to bottom right, theme("colors.cyan.500"), theme("colors.teal.500"))',
      },
      backgroundSize: {
        'grid-size': '30px 30px',
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px theme("colors.primary.500/30")',
        'glow-secondary': '0 0 25px -5px theme("colors.secondary.500/30")'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}


