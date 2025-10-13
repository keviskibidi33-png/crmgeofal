# Script para configurar el sistema completo
Write-Host "=== Configurando Sistema Completo CRM GeoFal ===" -ForegroundColor Green

Write-Host "Este script configurará:" -ForegroundColor Cyan
Write-Host "1. Frontend accesible desde internet" -ForegroundColor White
Write-Host "2. Backend accesible desde internet" -ForegroundColor White
Write-Host "3. Base de datos local (solo accesible desde tu computadora)" -ForegroundColor White

# Verificar que el backend esté corriendo
Write-Host "`nVerificando que el backend esté corriendo..." -ForegroundColor Yellow
$backendRunning = netstat -ano | findstr :4000
if ($backendRunning) {
    Write-Host "✅ Backend corriendo en puerto 4000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend no está corriendo. Inicia el backend primero:" -ForegroundColor Red
    Write-Host "   cd backend && npm start" -ForegroundColor White
    exit
}

# Crear configuración del frontend para usar backend local
Write-Host "`nConfigurando frontend para usar backend local..." -ForegroundColor Cyan
$frontendConfig = @"
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
"@

$frontendConfig | Out-File -FilePath "frontend/vite.config.js" -Encoding UTF8
Write-Host "✅ Configuración del frontend actualizada" -ForegroundColor Green

# Detener procesos existentes
Write-Host "`nDeteniendo procesos existentes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 3

# Iniciar backend
Write-Host "`nIniciando backend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd backend; npm start" -WindowStyle Minimized

Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "Iniciando frontend..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd frontend; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 5

# Iniciar tunnels
Write-Host "`nIniciando tunnels de Cloudflare..." -ForegroundColor Cyan
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--url", "http://localhost:3000" -WindowStyle Normal

Write-Host "`n✅ Sistema configurado!" -ForegroundColor Green
Write-Host "`n📋 URLs disponibles:" -ForegroundColor Cyan
Write-Host "- Frontend local: http://localhost:3000" -ForegroundColor White
Write-Host "- Backend local: http://localhost:4000" -ForegroundColor White
Write-Host "- Frontend público: [URL que aparecerá en la ventana de cloudflared]" -ForegroundColor White

Write-Host "`n🔗 Para compartir con usuarios:" -ForegroundColor Yellow
Write-Host "Comparte la URL que aparecerá en la ventana de cloudflared" -ForegroundColor White
Write-Host "El frontend se conectará automáticamente al backend local" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
