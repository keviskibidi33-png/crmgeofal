# Script para iniciar los tunnels de Cloudflare para CRM GeoFal
Write-Host "=== Iniciando Tunnels de Cloudflare para CRM GeoFal ===" -ForegroundColor Green

# Verificar que cloudflared esté disponible
if (-not (Test-Path ".\cloudflared.exe")) {
    Write-Host "Descargando cloudflared..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
}

# Crear directorio para credenciales si no existe
$credDir = "$env:USERPROFILE\.cloudflared"
if (-not (Test-Path $credDir)) {
    New-Item -ItemType Directory -Path $credDir -Force
}

Write-Host "Iniciando tunnel para Backend (puerto 4000)..." -ForegroundColor Cyan
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--url", "http://localhost:4000" -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "Iniciando tunnel para Frontend (puerto 3000)..." -ForegroundColor Cyan
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--url", "http://localhost:3000" -WindowStyle Minimized

Write-Host "Tunnels iniciados. Las URLs aparecerán en las ventanas de cloudflared." -ForegroundColor Green
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
