@echo off
echo ========================================
echo    CRM GeoFal - Servidor Backend
echo ========================================
echo.
echo ¿Deseas iniciar el servidor? (S/N)
set /p choice=
if /i "%choice%"=="S" (
    echo.
    echo Configurando variables de entorno...
    set JWT_SECRET=mi_secreto_jwt_muy_seguro_para_crmgeofal_2025
    set PGHOST=localhost
    set PGPORT=5432
    set PGDATABASE=postgres
    set PGUSER=admin
    set PGPASSWORD=admin123
    set PORT=4000
    echo.
    echo Iniciando servidor backend...
    echo Servidor disponible en: http://localhost:4000
    echo Presiona Ctrl+C para detener el servidor
    echo.
    node index.js
) else (
    echo Servidor no iniciado.
)
echo.
pause
