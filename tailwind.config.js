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
          50: '#F4F7F4',
          100: '#E2EBE2',
          200: '#C7D9C7',
          300: '#A3BF9E',
          400: '#7FA379',
          500: '#5C8A54',
          600: '#476D40',
          700: '#34522F',
          800: '#23391F',
          900: '#152412',
        },
        gold: {
          100: '#FFF8E7',
          200: '#FBF0BE',
          300: '#F8E7A1',
          400: '#F5D061',
          500: '#E5B82C',
          600: '#C99E1A',
          700: '#9B7A12',
          800: '#6E560B',
        },
        champagne: {
          100: '#FDFBF7',
          200: '#F8F3E6',
          300: '#EFE4CD',
          400: '#E2CF9D',
          500: '#D4AF37',
          600: '#B89326',
          700: '#8C6C1B',
        },
        river: {
          800: '#141E28',
          900: '#0E1620',
          950: '#0B0E14',
        },
        cream: {
          50: '#FFFDFB',
          100: '#FAF8F5',
          200: '#F2EDE4',
        },
        dark: {
          800: '#1A1E26',
          900: '#121620',
          950: '#0B0E14',
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
