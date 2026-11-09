/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#EAE2D3',
          400: '#DFCDB8',
          DEFAULT: '#FAF7F0',
        },
        olive: {
          50: '#F4F7EE',
          100: '#E7EEDC',
          200: '#D2DFC1',
          300: '#ADC492',
          400: '#7E9F57',
          500: '#5A7538',
          600: '#4A622E',
          700: '#3D5126',
          800: '#314120',
          900: '#222E17',
          DEFAULT: '#4A622E',
        },
        navy: {
          600: '#32405C',
          700: '#27334A',
          800: '#1F293B',
          900: '#161D2B',
          DEFAULT: '#1F293B',
        },
        sand: {
          100: '#F7F3EB',
          200: '#EDE6D8',
          300: '#DFD4BF',
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
