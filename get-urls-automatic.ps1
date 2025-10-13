# Script para obtener automáticamente las URLs de los tunnels
Write-Host "=== Obteniendo URLs de Tunnels Automáticamente ===" -ForegroundColor Green

# Función para obtener URLs de los logs de cloudflared
function Get-TunnelUrls {
    $urls = @()
    
    # Buscar en los logs del sistema o procesos
    try {
        # Intentar obtener información de los procesos de cloudflared
        $processes = Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}
        
        if ($processes) {
            Write-Host "Tunnels activos encontrados: $($processes.Count)" -ForegroundColor Cyan
            
            # Crear nuevos tunnels para obtener URLs limpias
            Write-Host "`nCreando tunnels temporales para obtener URLs..." -ForegroundColor Yellow
            
            # Tunnel para backend
            Write-Host "Creando tunnel para Backend..." -ForegroundColor Cyan
            $backendJob = Start-Job -ScriptBlock {
                & ".\cloudflared.exe" tunnel --url http://localhost:4000 2>&1 | Select-String "https://.*\.trycloudflare\.com"
            }
            
            Start-Sleep -Seconds 5
            
            # Tunnel para frontend  
            Write-Host "Creando tunnel para Frontend..." -ForegroundColor Cyan
            $frontendJob = Start-Job -ScriptBlock {
                & ".\cloudflared.exe" tunnel --url http://localhost:3000 2>&1 | Select-String "https://.*\.trycloudflare\.com"
            }
            
            Start-Sleep -Seconds 5
            
            # Obtener resultados
            $backendResult = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
            $frontendResult = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
            
            # Limpiar jobs
            Remove-Job -Job $backendJob, $frontendJob -Force
            
            if ($backendResult) {
                Write-Host "`n🔗 Backend URL: $($backendResult.Line)" -ForegroundColor Green
            }
            
            if ($frontendResult) {
                Write-Host "🔗 Frontend URL: $($frontendResult.Line)" -ForegroundColor Green
            }
            
            if (-not $backendResult -and -not $frontendResult) {
                Write-Host "`n⚠️  No se pudieron obtener las URLs automáticamente." -ForegroundColor Yellow
                Write-Host "Revisa las ventanas de cloudflared que se abrieron." -ForegroundColor White
            }
        } else {
            Write-Host "No se encontraron tunnels activos." -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Error al obtener URLs: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Get-TunnelUrls

Write-Host "`n📋 Instrucciones:" -ForegroundColor Cyan
Write-Host "1. Si no aparecieron las URLs, revisa las ventanas de cloudflared" -ForegroundColor White
Write-Host "2. Busca líneas que contengan 'https://' seguido de .trycloudflare.com" -ForegroundColor White
Write-Host "3. Comparte la URL del frontend con los vendedores" -ForegroundColor White
Write-Host "4. Usa la URL del backend para APIs si es necesario" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
