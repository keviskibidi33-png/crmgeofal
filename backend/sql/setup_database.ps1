# =====================================================
# SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS CRMGeoFal
# =====================================================
# Este script configura la base de datos PostgreSQL para CRMGeoFal
# Uso: .\setup_database.ps1

param(
    [string]$DatabaseName = "crmgeofal",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Username = "postgres",
    [string]$Password = ""
)

Write-Host "=====================================================" -ForegroundColor Green
Write-Host "CONFIGURACIÓN DE BASE DE DATOS CRMGeoFal" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Verificar si psql está disponible
try {
    $psqlVersion = psql --version
    Write-Host "PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: PostgreSQL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala PostgreSQL y asegúrate de que psql esté en el PATH" -ForegroundColor Red
    exit 1
}

# Crear la base de datos si no existe
Write-Host "Creando base de datos '$DatabaseName'..." -ForegroundColor Yellow
$createDbCommand = "CREATE DATABASE $DatabaseName;"
echo $createDbCommand | psql -h $Host -p $Port -U $Username -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "Base de datos '$DatabaseName' creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "La base de datos '$DatabaseName' ya existe o hubo un error" -ForegroundColor Yellow
}

# Ejecutar el esquema completo
Write-Host "Ejecutando esquema completo..." -ForegroundColor Yellow
$env:PGPASSWORD = $Password
psql -h $Host -p $Port -U $Username -d $DatabaseName -f "complete_schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Esquema ejecutado exitosamente" -ForegroundColor Green
} else {
    Write-Host "ERROR: Hubo un problema ejecutando el esquema" -ForegroundColor Red
    exit 1
}

# Verificar las tablas creadas
Write-Host "Verificando tablas creadas..." -ForegroundColor Yellow
$verifyQuery = @"
SELECT 
    COUNT(*) as total_tables,
    'Tablas creadas exitosamente' as message
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'companies', 'projects', 'categories', 'subcategories',
        'services', 'subservices', 'quote_variants', 'quotes', 'quote_items',
        'project_attachments', 'project_history', 'project_services',
        'project_whatsapp_notices', 'tickets', 'ticket_history',
        'leads', 'invoices', 'evidences', 'activities', 'notifications',
        'monthly_goals', 'audit_log', 'audit_quotes', 'audit_cleanup_log',
        'export_history', 'project_categories', 'project_subcategories'
    );
"@

echo $verifyQuery | psql -h $Host -p $Port -U $Username -d $DatabaseName

Write-Host "=====================================================" -ForegroundColor Green
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "Base de datos: $DatabaseName" -ForegroundColor Cyan
Write-Host "Host: $Host:$Port" -ForegroundColor Cyan
Write-Host "Usuario: $Username" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Green
