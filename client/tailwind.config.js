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
          900: '#0B192C',
          850: '#0F2942',
          800: '#1E3A8A',
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6',
          100: '#DBEAFE',
          50: '#F0F7FF',
        },
        cardbg: '#F8FAFC',
        surface: '#FFFFFF',
        accent: {
          green: '#059669',
          amber: '#D97706',
          rose: '#E11D48',
          indigo: '#4F46E5',
          cyan: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
