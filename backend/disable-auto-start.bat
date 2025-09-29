@echo off
echo ========================================
echo    Desactivando Auto-inicio del Servidor
echo ========================================
echo.
echo Este script desactivará el inicio automático del servidor.
echo.
echo ¿Continuar? (S/N)
set /p choice=
if /i "%choice%"=="S" (
    echo.
    echo Desactivando procesos automáticos...
    
    REM Detener cualquier proceso de Node.js ejecutándose
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
        echo Deteniendo proceso PID %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    
    REM Crear archivo de control
    echo AUTO_START_DISABLED=true > .auto-start-control
    echo.
    echo ✓ Auto-inicio desactivado
    echo ✓ Procesos detenidos
    echo.
    echo Para iniciar el servidor manualmente, usa:
    echo   - start-server.bat (inicio simple)
    echo   - control-server.bat (control avanzado)
    echo.
) else (
    echo Operación cancelada.
)
echo.
pause
