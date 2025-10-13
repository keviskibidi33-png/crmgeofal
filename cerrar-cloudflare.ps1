# Script para cerrar todos los servicios de Cloudflare
Write-Host "=== Cerrando Servicios de Cloudflare ===" -ForegroundColor Red

# Buscar y detener procesos de cloudflared
Write-Host "Buscando procesos de cloudflared..." -ForegroundColor Yellow
$cloudflareProcesses = Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}

if ($cloudflareProcesses) {
    Write-Host "Encontrados $($cloudflareProcesses.Count) procesos de cloudflared:" -ForegroundColor Cyan
    foreach ($process in $cloudflareProcesses) {
        Write-Host "PID: $($process.Id) - Iniciado: $($process.StartTime)" -ForegroundColor White
    }
    
    Write-Host "`nDeteniendo procesos de cloudflared..." -ForegroundColor Yellow
    $cloudflareProcesses | Stop-Process -Force
    Write-Host "✅ Procesos de cloudflared detenidos." -ForegroundColor Green
} else {
    Write-Host "No se encontraron procesos de cloudflared corriendo." -ForegroundColor Yellow
}

# Verificar que no hay procesos en los puertos 3000 y 4000 relacionados con cloudflare
Write-Host "`nVerificando puertos..." -ForegroundColor Cyan
$port3000 = netstat -ano | findstr :3000
$port4000 = netstat -ano | findstr :4000

if ($port3000) {
    Write-Host "Puerto 3000 en uso:" -ForegroundColor Yellow
    Write-Host $port3000 -ForegroundColor White
} else {
    Write-Host "Puerto 3000 libre." -ForegroundColor Green
}

if ($port4000) {
    Write-Host "Puerto 4000 en uso:" -ForegroundColor Yellow
    Write-Host $port4000 -ForegroundColor White
} else {
    Write-Host "Puerto 4000 libre." -ForegroundColor Green
}

Write-Host "`n✅ Servicios de Cloudflare cerrados." -ForegroundColor Green
Write-Host "Los tunnels ya no están activos." -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
