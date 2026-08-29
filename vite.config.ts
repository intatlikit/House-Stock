import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages เสิร์ฟ project site จาก /<repo-name>/ ไม่ใช่ root
// ตอน dev (npm run dev) ใช้ '/' ตามปกติ, ตอน build ใช้ base ตาม repo
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/House-Stock/' : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
