import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#27211d',
        cream: '#f8f1e7',
        paper: '#fffaf2',
        panel: '#f3eadf',
        panelSoft: '#fff7ed',
        line: '#ddd0c1',
        amber: '#c98a2e',
        sky: '#687a52',
        coral: '#bf6b4c',
        charcoal: '#27211d',
        clay: '#a85f3d',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 22px 80px rgba(168, 95, 61, 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
