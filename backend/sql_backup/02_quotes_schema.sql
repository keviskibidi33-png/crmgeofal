-- Tabla de adjuntos de proyectos (solo ventas)
CREATE TABLE IF NOT EXISTS project_attachments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id),
  file_url TEXT NOT NULL,
  file_type VARCHAR(20), -- pdf, excel, etc
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabla de clientes (empresas y personas naturales) - ya definida en crm_schema.sql, solo agregamos columnas
ALTER TABLE companies ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'empresa';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS dni VARCHAR(15);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100);

-- Tabla de proyectos (ya definida en crm_schema.sql, solo agregamos columnas si no existen)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vendedor_id INTEGER REFERENCES users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS laboratorio_id INTEGER REFERENCES users(id);

-- Tabla de variantes/plantillas de cotización
CREATE TABLE IF NOT EXISTS quote_variants (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  image_url TEXT, -- opcional: imagen de la variante para selección visual
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
  subtotal NUMERIC(12,2) DEFAULT 0,
  igv NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2),
  status VARCHAR(30) DEFAULT 'borrador',
  reference TEXT,
  meta JSONB,
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

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS igv NUMERIC(12,2) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS meta JSONB;
-- Añadir columna image_url a variantes si no existe
ALTER TABLE quote_variants ADD COLUMN IF NOT EXISTS image_url TEXT;