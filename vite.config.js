import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PROXY_ROUTES = {
  '/api/channels': {
    target: 'https://cdn.flive.dpdns.org',
    rewrite: () => '/channels.json',
  },
  '/api/count': {
    target: 'https://stats.flive.dpdns.org',
    rewrite: () => '/count',
  },
}

const proxy = Object.fromEntries(
  Object.entries(PROXY_ROUTES).map(([route, cfg]) => [
    route,
    { ...cfg, changeOrigin: true, headers: { Referer: cfg.target + '/' } },
  ]),
)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy,
  },
  preview: {
    port: 4173,
    proxy,
  },
})
