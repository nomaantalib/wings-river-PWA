import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#F5F9F3',
          100: '#E7F3E2',
          200: '#D0E9C7',
          300: '#B5DDA7',
          400: '#96CD85',
          500: '#78BE62',
          600: '#5EA24A',
          700: '#4A813A',
          800: '#345E28',
          900: '#28461E',
        },
        gold: {
          200: '#FBF0BE',
          300: '#F8E7A1',
          400: '#F5D061',
          500: '#E5B82C',
          600: '#C99E1A',
          700: '#9B7A12',
        },
        cream: {
          50: '#FFFDFB',
          100: '#FAF8F5',
          200: '#F2EDE4',
        },
        dark: {
          800: '#242424',
          900: '#1B1B1B',
          950: '#121212',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
    },
  },
  plugins: [],
};

export default config;
