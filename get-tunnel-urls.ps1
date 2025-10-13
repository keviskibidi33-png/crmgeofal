# Script para obtener las URLs de los tunnels activos
Write-Host "=== URLs de Tunnels Activos ===" -ForegroundColor Green

# Verificar procesos de cloudflared
$processes = Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}
if ($processes) {
    Write-Host "Se encontraron $($processes.Count) tunnels activos:" -ForegroundColor Cyan
    
    # Intentar obtener URLs de los logs o procesos
    Write-Host "`nPara obtener las URLs exactas:" -ForegroundColor Yellow
    Write-Host "1. Revisa las ventanas de cloudflared que se abrieron" -ForegroundColor White
    Write-Host "2. Busca líneas que contengan 'https://' seguido de un dominio .trycloudflare.com" -ForegroundColor White
    Write-Host "3. Las URLs típicas serán algo como:" -ForegroundColor White
    Write-Host "   - Backend: https://xxxxx-xxxxx-xxxxx.trycloudflare.com" -ForegroundColor Green
    Write-Host "   - Frontend: https://yyyyy-yyyyy-yyyyy.trycloudflare.com" -ForegroundColor Green
    
    Write-Host "`nProcesos activos:" -ForegroundColor Cyan
    $processes | ForEach-Object {
        Write-Host "PID: $($_.Id) - Iniciado: $($_.StartTime)" -ForegroundColor White
    }
} else {
    Write-Host "No se encontraron tunnels activos." -ForegroundColor Red
    Write-Host "Ejecuta 'start-tunnels.ps1' para iniciar los tunnels." -ForegroundColor Yellow
}

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
