# Script para detener los tunnels de Cloudflare
Write-Host "=== Deteniendo Tunnels de Cloudflare ===" -ForegroundColor Red

# Detener todos los procesos de cloudflared
$processes = Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}
if ($processes) {
    Write-Host "Deteniendo $($processes.Count) procesos de cloudflared..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Write-Host "Tunnels detenidos correctamente." -ForegroundColor Green
} else {
    Write-Host "No se encontraron procesos de cloudflared ejecutándose." -ForegroundColor Yellow
}

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
