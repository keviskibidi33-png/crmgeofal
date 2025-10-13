# Script para reiniciar completamente el frontend
Write-Host "=== Reiniciando Frontend Completamente ===" -ForegroundColor Red

# Detener todos los procesos de Node.js
Write-Host "Deteniendo todos los procesos de Node.js..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Esperar un momento
Start-Sleep -Seconds 3

# Verificar que no hay procesos de Node corriendo
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"} -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Aún hay procesos de Node corriendo. Forzando cierre..." -ForegroundColor Yellow
    taskkill /f /im node.exe
    Start-Sleep -Seconds 2
}

# Navegar al directorio del frontend
Set-Location "frontend"

# Limpiar caché de npm
Write-Host "Limpiando caché de npm..." -ForegroundColor Cyan
npm cache clean --force

# Reinstalar dependencias (opcional, pero puede ayudar)
Write-Host "Reinstalando dependencias..." -ForegroundColor Cyan
npm install

# Iniciar el frontend
Write-Host "Iniciando frontend con nueva configuración..." -ForegroundColor Green
npm run dev
