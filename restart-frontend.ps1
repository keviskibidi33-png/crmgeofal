# Script para reiniciar el frontend con la nueva configuración
Write-Host "=== Reiniciando Frontend con Configuración de Cloudflare Tunnel ===" -ForegroundColor Green

# Detener procesos de Vite si están corriendo
Write-Host "Deteniendo procesos de Vite..." -ForegroundColor Yellow
$viteProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.CommandLine -like "*vite*"}
if ($viteProcesses) {
    $viteProcesses | Stop-Process -Force
    Write-Host "Procesos de Vite detenidos." -ForegroundColor Green
}

# Esperar un momento
Start-Sleep -Seconds 2

# Navegar al directorio del frontend e iniciar
Write-Host "Iniciando frontend con nueva configuración..." -ForegroundColor Cyan
Set-Location "frontend"
npm run dev

Write-Host "Frontend reiniciado. Ahora debería funcionar con Cloudflare Tunnel." -ForegroundColor Green
