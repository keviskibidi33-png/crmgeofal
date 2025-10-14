Write-Host "=== INICIANDO SISTEMA CRM GEOFAL ===" -ForegroundColor Green
Write-Host ""

# Verificar que el backend esté corriendo
Write-Host "Verificando backend..." -ForegroundColor Cyan
$backendRunning = netstat -ano | findstr ":4000"
if ($backendRunning) {
    Write-Host "✅ Backend corriendo en puerto 4000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend no está corriendo. Iniciando..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd backend; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Verificar que el frontend esté compilado
Write-Host "Verificando frontend..." -ForegroundColor Cyan
if (Test-Path "frontend/dist/index.html") {
    Write-Host "✅ Frontend compilado" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend no compilado. Compilando..." -ForegroundColor Yellow
    Set-Location frontend
    npm run build
    Set-Location ..
}

# Detener procesos anteriores
Write-Host "Deteniendo procesos anteriores..." -ForegroundColor Cyan
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Crear tunnel con ngrok
Write-Host "Creando tunnel con ngrok..." -ForegroundColor Cyan
Write-Host "Esto puede tomar unos segundos..." -ForegroundColor Yellow

# Iniciar ngrok en una nueva ventana
Start-Process powershell -ArgumentList "-Command", ".\ngrok.exe http 4000" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== SISTEMA INICIADO ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "ngrok: Ventana abierta con tunnel" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ ngrok está corriendo en una ventana separada" -ForegroundColor Green
Write-Host "Busca la URL en la ventana de ngrok (ej: https://xxxxx.ngrok.io)" -ForegroundColor White
Write-Host ""
Write-Host "Presiona Enter para continuar..." -ForegroundColor Yellow
Read-Host