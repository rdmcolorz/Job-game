import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Avoid browser CORS errors in local dev by routing through Vite's server.
      '/api/adzuna': {
        target: 'https://api.adzuna.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adzuna/, ''),
      },
    },
  },
})
