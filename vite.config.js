import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA config — offline-first, ติดตั้งลง home screen ได้
// base: '/' สำหรับ Netlify/Vercel; GitHub Pages ตั้ง BASE_PATH=/<repo>/ ผ่าน Action
// start_url/scope/id ต้องอิง base ไม่งั้นเปิดจาก home screen แล้ว 404 (เมื่อ deploy ใต้ sub-path)
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'TimeSpend — เวลาคือเงิน',
        short_name: 'TimeSpend',
        description: 'แปลงการใช้เงินเป็นเวลาชีวิต',
        lang: 'th',
        theme_color: '#050a06',
        background_color: '#050a06',
        display: 'standalone',
        orientation: 'portrait',
        id: base,
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ]
})
