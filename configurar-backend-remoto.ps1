# Script para configurar el frontend para usar el backend remoto
Write-Host "=== Configurando Frontend para Backend Remoto ===" -ForegroundColor Green

Write-Host "Primero necesitamos la URL del backend de Cloudflare." -ForegroundColor Yellow
Write-Host "Busca en las ventanas de cloudflared la URL que apunta al puerto 4000." -ForegroundColor White
Write-Host "Debería verse algo como: https://xxxxx-xxxxx-xxxxx.trycloudflare.com" -ForegroundColor Cyan

$backendUrl = Read-Host "`nIngresa la URL del backend (sin http://): "

if ($backendUrl) {
    Write-Host "Configurando frontend para usar: https://$backendUrl" -ForegroundColor Green
    
    # Crear configuración temporal
    $configContent = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'all',
      'accessories-dat-march-throughout.trycloudflare.com',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'https://$backendUrl',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
"@
    
    # Guardar configuración
    $configContent | Out-File -FilePath "frontend/vite.config.js" -Encoding UTF8
    
    Write-Host "`n✅ Configuración actualizada!" -ForegroundColor Green
    Write-Host "Ahora reinicia el frontend para aplicar los cambios." -ForegroundColor Yellow
    
} else {
    Write-Host "No se ingresó URL del backend." -ForegroundColor Red
}

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
