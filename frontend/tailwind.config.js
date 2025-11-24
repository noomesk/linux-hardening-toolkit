/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          pink: '#FF006E',
          purple: '#8338EC',
          blue: '#3A86FF',
          green: '#06FFA5',
          yellow: '#FFBE0B',
          dark: '#0A0E27',
          darker: '#050816',
        },
        neon: {
          pink: '#FF10F0',
          blue: '#00F0FF',
          green: '#39FF14',
          purple: '#BF40BF',
          orange: '#FF6600',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        cyber: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 10px #FF10F0, 0 0 20px #FF10F0, 0 0 30px #FF10F0',
        'neon-blue': '0 0 10px #00F0FF, 0 0 20px #00F0FF, 0 0 30px #00F0FF',
        'neon-green': '0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14',
        'neon-purple': '0 0 10px #BF40BF, 0 0 20px #BF40BF, 0 0 30px #BF40BF',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flicker': 'flicker 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF10F0, 0 0 10px #FF10F0' },
          '100%': { boxShadow: '0 0 10px #FF10F0, 0 0 20px #FF10F0, 0 0 30px #FF10F0' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
