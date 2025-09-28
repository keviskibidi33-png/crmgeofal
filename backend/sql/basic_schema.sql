-- Script básico con solo las tablas esenciales
-- Ejecutar este archivo para crear las tablas básicas del sistema

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  apellido TEXT,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  area TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  ruc VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  type VARCHAR(20) DEFAULT 'empresa',
  dni VARCHAR(15),
  email VARCHAR(100),
  phone VARCHAR(30),
  contact_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150),
  vendedor_id INTEGER REFERENCES users(id),
  laboratorio_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de subcategorías
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('laboratorio', 'ingenieria')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de subservicios
CREATE TABLE IF NOT EXISTS subservices (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  norma VARCHAR(100),
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'media',
  status VARCHAR(20) NOT NULL DEFAULT 'abierto',
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
