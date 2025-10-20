# Script para configurar ngrok para frontend y backend
Write-Host "=== CONFIGURANDO NGROK COMPLETO ===" -ForegroundColor Green

# Detener procesos anteriores
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Verificar que el backend esté corriendo
$backendRunning = netstat -ano | findstr ":4000"
if (!$backendRunning) {
    Write-Host "❌ Backend no está corriendo. Iniciando..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd backend; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Verificar que el frontend esté corriendo
$frontendRunning = netstat -ano | findstr ":3000"
if (!$frontendRunning) {
    Write-Host "❌ Frontend no está corriendo. Iniciando..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd frontend/dist; npx serve . -p 3000" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Crear túnel para backend (puerto 4000)
Write-Host "🚀 Creando túnel para backend (puerto 4000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", ".\ngrok.exe http 4000" -WindowStyle Normal

Start-Sleep -Seconds 5

# Obtener URL del backend
$backendUrl = $null
try {
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $backendTunnel = $tunnels.tunnels | Where-Object { $_.config.addr -eq "http://localhost:4000" }
    if ($backendTunnel) {
        $backendUrl = $backendTunnel.public_url
        Write-Host "✅ Backend URL: $backendUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ No se pudo obtener la URL del backend automáticamente" -ForegroundColor Yellow
}

# Crear túnel para frontend (puerto 3000) en una nueva ventana
Write-Host "🚀 Creando túnel para frontend (puerto 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", ".\ngrok.exe http 3000" -WindowStyle Normal

Start-Sleep -Seconds 5

# Obtener URL del frontend
$frontendUrl = $null
try {
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $frontendTunnel = $tunnels.tunnels | Where-Object { $_.config.addr -eq "http://localhost:3000" }
    if ($frontendTunnel) {
        $frontendUrl = $frontendTunnel.public_url
        Write-Host "✅ Frontend URL: $frontendUrl" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ No se pudo obtener la URL del frontend automáticamente" -ForegroundColor Yellow
}

# Actualizar archivo .env del frontend
if ($backendUrl) {
    $envContent = @"
# Configuración de API para ngrok
VITE_API_URL=$backendUrl/api
VITE_NGROK_URL=$backendUrl
"@
    $envContent | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Archivo .env actualizado con URL: $backendUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== CONFIGURACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Backend local: http://localhost:4000" -ForegroundColor White
Write-Host "   Frontend local: http://localhost:3000" -ForegroundColor White
if ($backendUrl) {
    Write-Host "   Backend público: $backendUrl" -ForegroundColor White
    Write-Host "   API pública: $backendUrl/api" -ForegroundColor White
}
if ($frontendUrl) {
    Write-Host "   Frontend público: $frontendUrl" -ForegroundColor White
}
Write-Host ""
Write-Host "📱 Para acceder desde otros dispositivos:" -ForegroundColor Cyan
if ($frontendUrl) {
    Write-Host "   Usa esta URL: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "   Revisa las ventanas de ngrok para obtener las URLs" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "✅ Sistema listo para acceso externo!" -ForegroundColor Green
