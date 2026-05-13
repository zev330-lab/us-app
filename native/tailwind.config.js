/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        thinking: '#4A90D9',
        feeling: '#E8727A',
        blend: '#9B6B9E',
        'bg-deep': '#0F0F1E',
        'bg-start': '#1A1A2E',
        'bg-end': '#16213E',
        accent: '#C9A96E',
        'text-primary': '#F5F0EB',
        'text-secondary': 'rgba(245, 240, 235, 0.55)',
      },
      fontFamily: {
        display: ['PlayfairDisplay-Regular', 'serif'],
        body: ['Inter-Regular', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
