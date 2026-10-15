/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary Brand
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        cjk: [
          'PingFang SC',
          'Microsoft YaHei',
          'Noto Sans SC',
          'Heiti SC',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'hud': '0 25px 40px -12px rgba(15, 23, 42, 0.25), 0 10px 20px -5px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
