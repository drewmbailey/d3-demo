import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config tuned for micro‑frontend embed (hash filenames, base-relative assets)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    sourcemap: true,
    assetsInlineLimit: 0
  },
});
