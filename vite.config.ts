import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        gettingStarted: page('./getting-started/index.html'),
        faq: page('./faq/index.html'),
        notFound: page('./404.html'),
      },
    },
  },
  server: { port: 5175 },
});
