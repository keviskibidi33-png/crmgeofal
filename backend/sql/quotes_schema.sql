-- Esquema de cotizaciones para CRMGeoFal

-- Tabla de clientes (empresas y personas naturales)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL DEFAULT 'empresa', -- 'empresa' o 'persona_natural'
  ruc VARCHAR(20), -- solo para empresas
  dni VARCHAR(15), -- solo para persona natural
  name VARCHAR(150) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de variantes/plantillas de cotización
CREATE TABLE IF NOT EXISTS quote_variants (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  conditions JSONB, -- campos y reglas específicas
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES quote_variants(id),
  created_by INTEGER REFERENCES users(id),
  client_contact VARCHAR(100),
  client_email VARCHAR(100),
  client_phone VARCHAR(30),
  issue_date DATE,
  total NUMERIC(12,2),
  status VARCHAR(30) DEFAULT 'borrador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ítems de cotización
CREATE TABLE IF NOT EXISTS quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  code VARCHAR(50),
  description TEXT,
  norm VARCHAR(50),
  unit_price NUMERIC(12,2),
  quantity INTEGER,
  partial_price NUMERIC(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría de cotizaciones
CREATE TABLE IF NOT EXISTS audit_quotes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- crear, editar, eliminar
  entity VARCHAR(30) NOT NULL, -- 'quote', 'quote_item', etc.
  entity_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
