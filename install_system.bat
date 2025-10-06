@echo off
echo ====================================================
echo    INSTALADOR AUTOMATICO - SISTEMA CRMGeoFal
echo ====================================================
echo.

echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado. Por favor instalar Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

echo.
echo [2/6] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend
    pause
    exit /b 1
)
echo ✅ Backend instalado

echo.
echo [3/6] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)
echo ✅ Frontend instalado

echo.
echo [4/6] Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar el frontend
    pause
    exit /b 1
)
echo ✅ Frontend compilado

echo.
echo [5/6] Configurando base de datos...
echo IMPORTANTE: Asegurese de que PostgreSQL este ejecutandose
echo y que las credenciales en backend/.env sean correctas
echo.
echo Presione cualquier tecla cuando haya configurado la base de datos...
pause >nul

echo.
echo [6/6] Iniciando servidor backend...
cd ..\backend
echo ✅ Sistema instalado correctamente!
echo.
echo Para iniciar el sistema:
echo 1. Backend: cd backend ^&^& npm run dev
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Acceso: http://localhost:3000
echo Usuario admin: admin@crmgeofal.com
echo.
pause
