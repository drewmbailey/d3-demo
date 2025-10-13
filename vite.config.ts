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
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
    strictPort: false,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
});
