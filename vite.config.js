import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contato: resolve(__dirname, 'contato.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
      },
    },
  },
});
