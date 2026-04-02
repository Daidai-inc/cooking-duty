import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/cooking-duty/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '料理分担管理',
        short_name: '料理分担',
        description: '2人生活の料理分担を管理するアプリ',
        theme_color: '#3baf6e',
        background_color: '#faf6f1',
        display: 'standalone',
        start_url: '/cooking-duty/',
        scope: '/cooking-duty/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})
