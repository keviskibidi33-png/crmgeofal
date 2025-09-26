# Documentación de Base de Datos - CRM GEOFAL

## 📋 Información General

- **Sistema**: PostgreSQL
- **Puerto**: 5432 (por defecto)
- **Base de datos**: postgres
- **Usuario**: admin
- **Contraseña**: admin123

## 🗄️ Estructura de Tablas

### 1. Tabla `users`
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor_comercial',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabla `companies`
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('empresa', 'persona')),
    ruc VARCHAR(11) UNIQUE,
    dni VARCHAR(8),
    name VARCHAR(200) NOT NULL,
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    contact_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Tabla `projects`
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tabla `quotes`
```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    meta JSONB,
    reference_type JSONB,
    status VARCHAR(20) DEFAULT 'borrador' CHECK (status IN ('borrador', 'enviada', 'aceptada', 'rechazada')),
    total_amount DECIMAL(12,2),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Tabla `services`
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Tabla `subservices`
```sql
CREATE TABLE subservices (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    norm VARCHAR(100),
    unit_price DECIMAL(10,2),
    unit VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Tabla `project_attachments`
```sql
CREATE TABLE project_attachments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id),
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Tabla `audit_logs`
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Scripts de Configuración

### Script de Creación Completa
```sql
-- 1. Crear base de datos
CREATE DATABASE crmgeofal;

-- 2. Conectar a la base de datos
\c crmgeofal;

-- 3. Ejecutar todos los esquemas en orden
\i 00_init.sql
\i 01_crm_schema.sql
\i 02_quotes_schema.sql
\i 03_audit_schema.sql
\i activities_schema.sql
\i audit_cleanup_tracking.sql
\i evidences_schema.sql
\i exports_schema.sql
\i invoices_schema.sql
\i leads_schema.sql
\i monthly_goals_schema.sql
\i notifications_schema.sql
\i services_schema.sql
\i subservices_schema.sql
\i tickets_schema.sql
\i update_export_history_schema.sql
\i update_project_attachments.sql
\i update_quotes_schema.sql
```

## 📊 Datos de Ejemplo

### Usuario Administrador
```sql
INSERT INTO users (username, email, password, name, role) VALUES 
('admin', 'admin@geofal.com', '$2b$10$hash_here', 'Administrador', 'admin');
```

### Servicios Principales
```sql
INSERT INTO services (name, description, category) VALUES 
('ENSAYO ESTÁNDAR', 'Ensayos estándar de laboratorio', 'Laboratorio'),
('ENSAYOS ESPECIALES', 'Ensayos especializados', 'Laboratorio'),
('ENSAYO AGREGADO', 'Ensayos de agregados', 'Laboratorio'),
('ENSAYOS DE CAMPO', 'Ensayos en campo', 'Campo'),
('ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', 'Análisis químico', 'Laboratorio'),
('ENSAYO QUÍMICO AGREGADO', 'Análisis químico de agregados', 'Laboratorio'),
('ENSAYO CONCRETO', 'Ensayos de concreto', 'Laboratorio'),
('ENSAYO ALBAÑILERÍA', 'Ensayos de albañilería', 'Laboratorio'),
('ENSAYO ROCA', 'Ensayos de roca', 'Laboratorio'),
('CEMENTO', 'Ensayos de cemento', 'Laboratorio'),
('ENSAYO PAVIMENTO', 'Ensayos de pavimento', 'Laboratorio'),
('ENSAYO ASFALTO', 'Ensayos de asfalto', 'Laboratorio'),
('ENSAYO MEZCLA ASFÁLTICO', 'Ensayos de mezcla asfáltica', 'Laboratorio'),
('EVALUACIONES ESTRUCTURALES', 'Evaluaciones estructurales', 'Campo'),
('IMPLEMENTACIÓN LABORATORIO EN OBRA', 'Implementación de laboratorio', 'Campo'),
('OTROS SERVICIOS', 'Servicios adicionales', 'General');
```

## 🚀 Instalación en Nueva Máquina

### 1. Requisitos Previos
```bash
# Instalar PostgreSQL
# Windows: Descargar desde https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql postgresql-contrib
# macOS: brew install postgresql
```

### 2. Configuración de Base de Datos
```bash
# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER admin WITH PASSWORD 'admin123';
CREATE DATABASE postgres OWNER admin;
GRANT ALL PRIVILEGES ON DATABASE postgres TO admin;
\q
```

### 3. Restaurar Esquemas
```bash
# Ejecutar script de restauración
psql -h localhost -U admin -d postgres -f restore_database.sql
```

### 4. Variables de Entorno
```bash
# Backend (.env)
PGUSER=admin
PGHOST=localhost
PGDATABASE=postgres
PGPASSWORD=admin123
PGPORT=5432
JWT_SECRET=mi_secreto_jwt_muy_seguro_para_crmgeofal_2025
```

## 📝 Notas Importantes

1. **Backup Regular**: Ejecutar `backup_database.sql` regularmente
2. **Índices**: Se crean automáticamente con las tablas
3. **Triggers**: Se configuran para auditoría automática
4. **Permisos**: Usuario `admin` tiene todos los permisos necesarios

## 🔍 Verificación de Instalación

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar datos de servicios
SELECT COUNT(*) FROM services;
SELECT COUNT(*) FROM subservices;

-- Verificar usuario admin
SELECT username, role FROM users WHERE username = 'admin';
```
