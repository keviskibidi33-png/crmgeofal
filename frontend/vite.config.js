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
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Asegurar que las respuestas del backend mantengan UTF-8
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Configuración para UTF-8
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
