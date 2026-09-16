import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// D02: dev server en :5173, API en :3005. /api se proxea para evitar CORS en local.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Alcance inicial: abrir la app offline. La cola de sincronización real
      // (IndexedDB/Dexie) se implementa en el módulo de P3.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
      manifest: {
        name: 'EBR / BPM',
        short_name: 'EBR',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0b5394',
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
});
