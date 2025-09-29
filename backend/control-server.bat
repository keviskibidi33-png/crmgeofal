@echo off
title CRM GeoFal - Control del Servidor
color 0A

:menu
cls
echo ========================================
echo    CRM GeoFal - Control del Servidor
echo ========================================
echo.
echo 1. Iniciar servidor (modo desarrollo)
echo 2. Iniciar servidor (modo producción)
echo 3. Detener servidor
echo 4. Verificar estado del servidor
echo 5. Salir
echo.
set /p opcion=Selecciona una opción (1-5): 

if "%opcion%"=="1" goto start_dev
if "%opcion%"=="2" goto start_prod
if "%opcion%"=="3" goto stop_server
if "%opcion%"=="4" goto check_status
if "%opcion%"=="5" goto exit
goto menu

:start_dev
echo.
echo Iniciando servidor en modo desarrollo...
set JWT_SECRET=mi_secreto_jwt_muy_seguro_para_crmgeofal_2025
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=admin
set PGPASSWORD=admin123
set PORT=4000
set NODE_ENV=development
echo.
echo Servidor disponible en: http://localhost:4000
echo Presiona Ctrl+C para detener el servidor
echo.
node index.js
goto menu

:start_prod
echo.
echo Iniciando servidor en modo producción...
set JWT_SECRET=mi_secreto_jwt_muy_seguro_para_crmgeofal_2025
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=admin
set PGPASSWORD=admin123
set PORT=4000
set NODE_ENV=production
echo.
echo Servidor disponible en: http://localhost:4000
echo Presiona Ctrl+C para detener el servidor
echo.
node index.js
goto menu

:stop_server
echo.
echo Deteniendo servidor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo Servidor detenido.
pause
goto menu

:check_status
echo.
echo Verificando estado del servidor...
netstat -ano | findstr :4000 >nul
if %errorlevel%==0 (
    echo ✓ Servidor está ejecutándose en puerto 4000
    netstat -ano | findstr :4000
) else (
    echo ✗ Servidor no está ejecutándose
)
echo.
pause
goto menu

:exit
echo.
echo ¡Hasta luego!
exit
