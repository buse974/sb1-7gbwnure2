import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['sql.js']
  },
  build: {
    commonjsOptions: {
      include: [/sql\.js/, /node_modules/]
    }
  }
});