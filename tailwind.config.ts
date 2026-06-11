import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080b12',
        panel: '#101522',
        panelSoft: '#151c2c',
        line: '#263249',
        mint: '#44d7b6',
        amber: '#f4b860',
        sky: '#68b7ff',
        coral: '#ff7f70',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 22px 80px rgba(68, 215, 182, 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
