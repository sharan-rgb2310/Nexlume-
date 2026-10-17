/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B3A8C',
        navyDark: '#0A2F78',
        royal: '#0B4DA2',
        green: '#0E8A4F',
        accentGreen: '#16A34A',
        mint: '#E6F7EE',
        mintText: '#0F6B3A',
        paleBlue: '#EAF3FF',
        border: '#D6E6FA',
      },
      fontFamily: {
        tamil: ['Noto Sans Tamil', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
