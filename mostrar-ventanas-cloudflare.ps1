# Script para mostrar las ventanas de Cloudflare y obtener las URLs
Write-Host "=== Ventanas de Cloudflare Tunnel ===" -ForegroundColor Green

# Verificar procesos activos
$processes = Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}
if ($processes) {
    Write-Host "Se encontraron $($processes.Count) procesos de cloudflared activos:" -ForegroundColor Cyan
    
    foreach ($process in $processes) {
        Write-Host "PID: $($process.Id) - Iniciado: $($process.StartTime)" -ForegroundColor White
    }
    
    Write-Host "`n🔍 Para ver las ventanas de cloudflared:" -ForegroundColor Yellow
    Write-Host "1. Presiona Alt + Tab para cambiar entre ventanas" -ForegroundColor White
    Write-Host "2. Busca ventanas de PowerShell o Command Prompt" -ForegroundColor White
    Write-Host "3. Las ventanas mostrarán las URLs de los tunnels" -ForegroundColor White
    
    Write-Host "`n📋 URLs que deberías ver en las ventanas:" -ForegroundColor Cyan
    Write-Host "Backend: https://nutritional-phases-diving-collected.trycloudflare.com" -ForegroundColor Green
    Write-Host "Frontend: https://condo-bits-photographic-residential.trycloudflare.com" -ForegroundColor Green
    
    Write-Host "`n🖥️  Para traer las ventanas al frente:" -ForegroundColor Yellow
    Write-Host "Ejecuta este comando para mostrar todas las ventanas:" -ForegroundColor White
    
    # Intentar traer las ventanas al frente
    try {
        $processes | ForEach-Object {
            $hwnd = $_.MainWindowHandle
            if ($hwnd -ne [IntPtr]::Zero) {
                [Microsoft.VisualBasic.Interaction]::AppActivate($_.Id)
            }
        }
        Write-Host "Ventanas traídas al frente." -ForegroundColor Green
    } catch {
        Write-Host "No se pudieron traer las ventanas automáticamente." -ForegroundColor Yellow
        Write-Host "Usa Alt + Tab para encontrarlas manualmente." -ForegroundColor White
    }
    
} else {
    Write-Host "No se encontraron procesos de cloudflared activos." -ForegroundColor Red
    Write-Host "Ejecuta '.\start-tunnels.ps1' para iniciar los tunnels." -ForegroundColor Yellow
}

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
