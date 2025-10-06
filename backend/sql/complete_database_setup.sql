-- =====================================================
-- SCRIPT SEGURO DE BASE DE DATOS - CRMGeoFal
-- =====================================================
-- Este script crea solo las tablas esenciales
-- =====================================================

-- =====================================================
-- 1. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    area VARCHAR(50),
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TABLA DE EMPRESAS/CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('empresa', 'persona')),
    ruc VARCHAR(11),
    dni VARCHAR(8),
    name VARCHAR(200) NOT NULL,
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    contact_name VARCHAR(100),
    city VARCHAR(50),
    sector VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. TABLA DE COTIZACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    total_amount DECIMAL(12,2),
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. TABLA DE ITEMS DE COTIZACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
    item_code VARCHAR(50),
    description TEXT NOT NULL,
    unit VARCHAR(20),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. TABLA DE PROYECTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INTEGER REFERENCES companies(id),
    manager_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. TABLA DE SERVICIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(20),
    base_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. TABLA DE EVIDENCIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS evidences (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. TABLA DE AUDITORÍA
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 9. TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. TABLA DE CONFIGURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR ÍNDICES ÚNICOS PARCIALES
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS companies_ruc_unique_idx ON companies (ruc) WHERE ruc IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS companies_dni_unique_idx ON companies (dni) WHERE dni IS NOT NULL;

-- =====================================================
-- CREAR ÍNDICES DE RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(type);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_user ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- =====================================================
-- FUNCIÓN PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CREAR TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Usuario administrador por defecto
INSERT INTO users (username, email, password_hash, full_name, role, area, phone) 
VALUES ('admin', 'admin@crmgeofal.com', '$2b$10$rQZ8KjH8KjH8KjH8KjH8KjH8KjH8KjH8KjH8KjH8KjH8KjH8KjH8Kj', 'Administrador del Sistema', 'admin', 'Administración', '999999999')
ON CONFLICT (username) DO NOTHING;

-- Configuraciones del sistema
INSERT INTO system_config (config_key, config_value, description) VALUES
('company_name', 'CRMGeoFal', 'Nombre de la empresa'),
('company_address', 'Lima, Perú', 'Dirección de la empresa'),
('company_phone', '+51 1 234 5678', 'Teléfono de la empresa'),
('company_email', 'info@crmgeofal.com', 'Email de la empresa'),
('igv_rate', '18', 'Tasa de IGV en porcentaje'),
('currency', 'PEN', 'Moneda principal del sistema')
ON CONFLICT (config_key) DO NOTHING;

-- Servicios básicos
INSERT INTO services (code, name, description, category, unit, base_price) VALUES
('SERV001', 'Análisis de Suelos', 'Análisis completo de propiedades físicas y químicas del suelo', 'Laboratorio', 'muestra', 150.00),
('SERV002', 'Estudios Topográficos', 'Levantamiento topográfico con GPS', 'Topografía', 'hectárea', 300.00),
('SERV003', 'Consultoría Ambiental', 'Asesoría en gestión ambiental', 'Consultoría', 'hora', 80.00),
('SERV004', 'Geología Aplicada', 'Estudios geológicos para construcción', 'Geología', 'proyecto', 500.00),
('SERV005', 'Hidrología', 'Estudios de recursos hídricos', 'Hidrología', 'estudio', 400.00)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VERIFICAR INSTALACIÓN
-- =====================================================
SELECT 
    'Base de datos CRMGeoFal configurada exitosamente' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public';