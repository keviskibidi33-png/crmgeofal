@echo off
echo ====================================================
echo    RESTAURADOR DE DATOS - SISTEMA CRMGeoFal
echo ====================================================
echo.

echo [1/4] Verificando directorio de respaldos...
if not exist "backend\exports" (
    echo ERROR: No se encontró el directorio de respaldos
    echo Asegúrese de haber ejecutado primero el script de exportación
    pause
    exit /b 1
)

echo ✅ Directorio de respaldos encontrado

echo.
echo [2/4] Listando respaldos disponibles...
dir /b backend\exports

echo.
echo [3/4] Seleccionando el respaldo más reciente...
for /f "delims=" %%i in ('dir /b /o-d backend\exports') do (
    set "latest_backup=%%i"
    goto :found
)
:found

echo ✅ Respaldo seleccionado: %latest_backup%

echo.
echo [4/4] Restaurando datos...
echo IMPORTANTE: Esto sobrescribirá los datos existentes
echo.
set /p confirm="¿Desea continuar? (s/n): "
if /i not "%confirm%"=="s" (
    echo Operación cancelada
    pause
    exit /b 0
)

echo Restaurando desde: backend\exports\%latest_backup%
echo.
echo Para restaurar manualmente:
echo 1. Abra pgAdmin o su cliente PostgreSQL
echo 2. Conecte a la base de datos crmgeofal
echo 3. Ejecute el archivo: backend\exports\%latest_backup%\backup_data.sql
echo.
echo O ejecute desde la línea de comandos:
echo psql -U postgres -d crmgeofal -f "backend\exports\%latest_backup%\backup_data.sql"
echo.
pause
