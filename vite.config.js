import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './', // important for Capacitor and Electron relative assets
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true
  }
});
