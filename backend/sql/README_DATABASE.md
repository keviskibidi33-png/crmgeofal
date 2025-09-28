# 🗄️ Configuración de Base de Datos CRMGeoFal

Este directorio contiene todos los scripts SQL necesarios para configurar la base de datos PostgreSQL del sistema CRMGeoFal.

## 📋 Tablas del Sistema (28 tablas)

### **Tablas Principales:**
1. **users** - Usuarios del sistema
2. **companies** - Empresas/clientes
3. **projects** - Proyectos
4. **categories** - Categorías
5. **subcategories** - Subcategorías

### **Sistema de Cotizaciones:**
6. **quote_variants** - Variantes de cotización
7. **quotes** - Cotizaciones
8. **quote_items** - Ítems de cotización

### **Servicios:**
9. **services** - Servicios principales
10. **subservices** - Subservicios
11. **project_services** - Servicios por proyecto

### **Gestión de Proyectos:**
12. **project_attachments** - Adjuntos de proyectos
13. **project_history** - Historial de proyectos
14. **project_whatsapp_notices** - Avisos WhatsApp
15. **project_categories** - Categorías de proyectos
16. **project_subcategories** - Subcategorías de proyectos

### **Sistema de Tickets:**
17. **tickets** - Tickets de soporte
18. **ticket_history** - Historial de tickets

### **CRM y Ventas:**
19. **leads** - Leads/prospectos
20. **invoices** - Facturas
21. **evidences** - Evidencias documentales

### **Sistema de Notificaciones:**
22. **activities** - Actividades del sistema
23. **notifications** - Notificaciones
24. **monthly_goals** - Metas mensuales

### **Auditoría:**
25. **audit_log** - Log general de auditoría
26. **audit_quotes** - Auditoría de cotizaciones
27. **audit_cleanup_log** - Log de limpieza de auditoría
28. **export_history** - Historial de exportaciones

## 🚀 Formas de Ejecutar el Schema

### **Opción 1: Script PowerShell (Recomendado para Windows)**
```powershell
# Navegar al directorio sql
cd backend/sql

# Ejecutar el script (ajustar parámetros según tu configuración)
.\setup_database.ps1 -DatabaseName "crmgeofal" -Host "localhost" -Port "5432" -Username "postgres" -Password "tu_password"
```

### **Opción 2: Comando psql directo**
```bash
# Crear la base de datos
createdb crmgeofal

# Ejecutar el esquema completo
psql -d crmgeofal -f complete_schema.sql

# Verificar tablas creadas
psql -d crmgeofal -f execute_schema.sql
```

### **Opción 3: Ejecutar archivos individuales**
```bash
# En orden de dependencias:
psql -d crmgeofal -f 00_init.sql
psql -d crmgeofal -f 01_crm_schema.sql
psql -d crmgeofal -f 02_quotes_schema.sql
psql -d crmgeofal -f services_schema.sql
psql -d crmgeofal -f tickets_schema.sql
psql -d crmgeofal -f activities_schema.sql
psql -d crmgeofal -f notifications_schema.sql
psql -d crmgeofal -f monthly_goals_schema.sql
psql -d crmgeofal -f evidences_schema.sql
psql -d crmgeofal -f leads_schema.sql
psql -d crmgeofal -f invoices_schema.sql
psql -d crmgeofal -f 03_audit_schema.sql
psql -d crmgeofal -f audit_cleanup_tracking.sql
```

## ⚙️ Configuración de Variables de Entorno

Crear archivo `.env` en el directorio `backend/`:

```env
# Base de datos PostgreSQL
PGUSER=postgres
PGPASSWORD=tu_password
PGHOST=localhost
PGDATABASE=crmgeofal
PGPORT=5432

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Otros
NODE_ENV=development
PORT=4000
```

## 🔍 Verificación

Después de ejecutar el schema, puedes verificar que todas las tablas se crearon correctamente:

```sql
-- Conectar a la base de datos
psql -d crmgeofal

-- Ver todas las tablas
\dt

-- Contar tablas
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Ver estructura de una tabla específica
\d users
\d companies
\d quotes
```

## 🐳 Docker (Alternativa)

Si prefieres usar Docker:

```bash
# Crear y ejecutar contenedor PostgreSQL
docker run --name crmgeofal-db -e POSTGRES_PASSWORD=tu_password -e POSTGRES_DB=crmgeofal -p 5432:5432 -d postgres:13

# Ejecutar el schema
psql -h localhost -U postgres -d crmgeofal -f complete_schema.sql
```

## 📝 Notas Importantes

- **Orden de ejecución**: Las tablas están ordenadas por dependencias para evitar errores
- **Índices**: Se crean automáticamente para optimizar consultas
- **Constraints**: Se aplican restricciones de integridad referencial
- **Comentarios**: Cada tabla tiene comentarios descriptivos
- **Backup**: Siempre haz backup antes de ejecutar en producción

## 🚨 Solución de Problemas

### Error: "relation does not exist"
- Verificar que las tablas se crearon en el orden correcto
- Revisar que no hay errores de sintaxis en los scripts

### Error: "permission denied"
- Verificar que el usuario tiene permisos para crear tablas
- Ejecutar como superusuario si es necesario

### Error: "database does not exist"
- Crear la base de datos primero: `createdb crmgeofal`

## 📞 Soporte

Si encuentras problemas, revisa:
1. Los logs de PostgreSQL
2. La configuración de conexión
3. Los permisos del usuario de base de datos
4. La sintaxis SQL en los archivos
