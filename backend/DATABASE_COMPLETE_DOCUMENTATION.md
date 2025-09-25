# 🗄️ CRM GEOFAL - BASE DE DATOS COMPLETA

## 📋 Resumen General

Este documento describe la estructura completa de la base de datos del sistema CRM GEOFAL, incluyendo todas las tablas, relaciones, índices y datos de ejemplo.

## 📊 Estadísticas de la Base de Datos

- **Total de tablas:** 25
- **Tamaño del archivo SQL:** 28.17 KB
- **Líneas totales:** 723
- **Fecha de generación:** 25/9/2025, 5:59:23 p.m.

## 🏗️ Estructura de Tablas

### 👥 **Gestión de Usuarios**
- `users` - Usuarios del sistema
- `companies` - Empresas y personas naturales

### 📁 **Gestión de Proyectos**
- `projects` - Proyectos principales
- `project_categories` - Categorías de proyectos
- `project_subcategories` - Subcategorías de proyectos
- `project_services` - Servicios de proyectos
- `project_history` - Historial de proyectos
- `project_attachments` - Archivos adjuntos

### 🔧 **Servicios y Subservicios**
- `services` - Servicios principales (Laboratorio/Ingeniería)
- `subservices` - Subservicios específicos
- `categories` - Categorías de servicios
- `subcategories` - Subcategorías de servicios

### 💰 **Gestión Comercial**
- `quotes` - Cotizaciones
- `quote_items` - Items de cotizaciones
- `quote_variants` - Variantes de cotizaciones
- `invoices` - Facturas
- `leads` - Prospectos

### 📊 **Seguimiento y Auditoría**
- `activities` - Actividades del sistema
- `audit_log` - Log de auditoría
- `audit_cleanup_log` - Log de limpieza automática
- `audit_quotes` - Auditoría de cotizaciones
- `export_history` - Historial de exportaciones

### 🎯 **Gestión de Objetivos**
- `monthly_goals` - Objetivos mensuales
- `notifications` - Notificaciones

### 🎫 **Sistema de Tickets**
- `tickets` - Tickets de soporte
- `ticket_history` - Historial de tickets
- `evidences` - Evidencias de tickets

## 🔗 Relaciones Principales

### **Proyectos ↔ Servicios**
```
projects → project_services → services
projects → project_services → subservices
```

### **Usuarios ↔ Proyectos**
```
users → projects (vendedor_id, laboratorio_id)
```

### **Empresas ↔ Proyectos**
```
companies → projects (client_id)
```

### **Auditoría ↔ Usuarios**
```
users → audit_log (user_id)
users → activities (user_id)
```

## 📈 Índices y Optimizaciones

### **Índices de Rendimiento**
- `idx_projects_status` - Búsqueda por estado
- `idx_projects_created_at` - Ordenamiento temporal
- `idx_audit_log_timestamp` - Auditoría temporal
- `idx_companies_type` - Filtrado por tipo de cliente

### **Índices Únicos**
- `uq_users_email` - Email único
- `uq_companies_ruc` - RUC único
- `uq_subservices_codigo` - Código único de subservicio

## 🚀 Datos de Ejemplo

### **Usuarios del Sistema**
- **Admin Sistema** (admin@crmgeofal.com) - Rol: admin
- **Vendedor Test** (vendedor@crmgeofal.com) - Rol: seller
- **Laboratorio Test** (laboratorio@crmgeofal.com) - Rol: laboratory

### **Empresas de Ejemplo**
- **Empresa Constructora ABC S.A.C.** - RUC: 20123456789
- **María González** - DNI: 12345678

### **Servicios Principales**
- **ENSAYO ESTÁNDAR** - 20 subservicios
- **ENSAYOS ESPECIALES** - 17 subservicios
- **ENSAYO AGREGADO** - 16 subservicios
- **ENSAYOS DE CAMPO** - 8 subservicios
- **ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO** - 5 subservicios
- **ENSAYO QUÍMICO AGREGADO** - 9 subservicios
- **ENSAYO CONCRETO** - 29 subservicios
- **ENSAYO ALBAÑILERÍA** - 18 subservicios
- **ENSAYO ROCA** - 4 subservicios
- **CEMENTO** - 4 subservicios
- **ENSAYO PAVIMENTO** - 13 subservicios
- **ENSAYO ASFALTO** - 25 subservicios
- **ENSAYO MEZCLA ASFÁLTICO** - 15 subservicios
- **EVALUACIONES ESTRUCTURALES** - 4 subservicios
- **IMPLEMENTACIÓN LABORATORIO EN OBRA** - 1 subservicio
- **OTROS SERVICIOS** - 4 subservicios
- **INGENIERÍA** - Servicios de ingeniería

## 🔧 Scripts de Mantenimiento

### **Scripts de Subservicios (Uno por Uno)**
- `add-estandar-subservices.js` - 20 subservicios
- `add-especiales-subservices.js` - 17 subservicios
- `add-agregado-subservices.js` - 16 subservicios
- `add-campo-subservices.js` - 8 subservicios
- `add-quimico-suelo-subservices.js` - 5 subservicios
- `add-quimico-agregado-subservices.js` - 9 subservicios
- `add-concreto-subservices.js` - 29 subservicios
- `add-albanileria-subservices.js` - 18 subservicios
- `add-roca-subservices.js` - 4 subservicios
- `add-cemento-subservices.js` - 4 subservicios
- `add-pavimento-subservices.js` - 13 subservicios
- `add-asfalto-subservices.js` - 25 subservicios
- `add-mezcla-asfaltico-subservices.js` - 15 subservicios
- `add-evaluaciones-estructurales-subservices.js` - 4 subservicios
- `add-implementacion-laboratorio-subservices.js` - 1 subservicio
- `add-otros-servicios-subservices.js` - 4 subservicios

### **Scripts de Utilidad**
- `create-ensayo-categories.js` - Crear categorías principales
- `create-cleanup-tracking.js` - Configurar limpieza automática
- `setup-cleanup-tracking.js` - Configurar seguimiento de limpieza
- `cleanup-categories-database.js` - Limpiar categorías obsoletas
- `remove-category-fields-only.js` - Remover campos de categorías

## 📁 Archivos Generados

### **Archivo Principal**
- `database_schema_complete.sql` - Estructura completa de la base de datos

### **Documentación**
- `DATABASE_COMPLETE_DOCUMENTATION.md` - Este archivo de documentación

## 🚀 Instrucciones de Uso

### **Restaurar Base de Datos**
```bash
psql -h localhost -U postgres -d crmgeofal -f database_schema_complete.sql
```

### **Verificar Estructura**
```bash
psql -h localhost -U postgres -d crmgeofal -c "\dt"
```

### **Verificar Datos**
```bash
psql -h localhost -U postgres -d crmgeofal -c "SELECT COUNT(*) FROM services;"
```

## 🔍 Verificación de Integridad

### **Checks de Integridad**
- ✅ Todas las tablas tienen claves primarias
- ✅ Las relaciones foreign key están configuradas
- ✅ Los índices están optimizados
- ✅ Los datos de ejemplo están incluidos
- ✅ La estructura es consistente

### **Validaciones**
- ✅ Usuarios tienen roles válidos
- ✅ Empresas tienen tipos correctos (empresa/persona_natural)
- ✅ Servicios tienen áreas correctas (laboratorio/ingenieria)
- ✅ Subservicios tienen códigos únicos
- ✅ Auditoría está configurada

## 📞 Soporte

Para cualquier consulta sobre la estructura de la base de datos, contactar al equipo de desarrollo.

---

**Generado automáticamente el:** 25/9/2025, 5:59:23 p.m.  
**Sistema:** CRM GEOFAL  
**Versión:** 1.0.0
