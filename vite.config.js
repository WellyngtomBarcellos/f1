import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_ORIGIN = 'https://cdn.flive.dpdns.org'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: API_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: { Referer: API_ORIGIN + '/' },
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: API_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
