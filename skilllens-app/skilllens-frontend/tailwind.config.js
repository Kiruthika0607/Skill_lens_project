/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          200: '#bae0fd',
          300: '#7cc4fb',
          400: '#36a3f7',
          500: '#0d85ec',
          600: '#0267ca',
          700: '#0352a4',
          800: '#074586',
          900: '#0c3a6f',
          950: '#08254b',
        },
        navy: {
          700: '#1e3a5f',
          800: '#132842',
          900: '#0a192f',
          950: '#050f1f',
        },
        surface: {
          DEFAULT: '#ffffff',
          card: '#f8fafc',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 25px -5px rgba(10, 25, 47, 0.1), 0 8px 10px -6px rgba(10, 25, 47, 0.05)',
      }
    },
  },
  plugins: [],
};
