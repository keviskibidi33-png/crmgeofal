import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permite acceso desde cualquier IP
    allowedHosts: 'all', // Permite todos los hosts
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend local
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
