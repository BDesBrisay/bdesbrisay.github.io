import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'LearnScroll',
        short_name: 'LearnScroll',
        description: 'A doomscroll replacement for daily learning.',
        theme_color: '#123524',
        background_color: '#f5f2df',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\/content\/manifest\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'manifest-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 7 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /\/content\/packs\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pack-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 90 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true
  }
});
