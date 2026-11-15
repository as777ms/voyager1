import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/nasa-gibs': {
        target: 'https://gibs.earthdata.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nasa-gibs/, ''),
      },
      '/nasa-svs': {
        target: 'https://svs.gsfc.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nasa-svs/, ''),
      },
    },
  },
})
