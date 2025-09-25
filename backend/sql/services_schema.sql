-- Tabla de servicios fijos (solo Laboratorio e Ingeniería)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('laboratorio', 'ingenieria')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evitar duplicados por nombre/area (case-insensitive en nombre)
CREATE UNIQUE INDEX IF NOT EXISTS uq_services_name_area ON services (LOWER(name), area);

-- Tabla de subservicios
CREATE TABLE IF NOT EXISTS subservices (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evitar duplicados de subservicios por servicio (case-insensitive en nombre)
CREATE UNIQUE INDEX IF NOT EXISTS uq_subservices_service_name ON subservices (service_id, LOWER(name));

-- Relación de servicios prestados a proyectos
CREATE TABLE IF NOT EXISTS project_services (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subservice_id INTEGER NOT NULL REFERENCES subservices(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  provided_by INTEGER REFERENCES users(id),
  provided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
