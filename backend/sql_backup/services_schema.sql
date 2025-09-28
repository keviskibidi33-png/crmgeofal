-- Tabla de servicios fijos (solo Laboratorio e Ingeniería)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  area VARCHAR(50) NOT NULL CHECK (area IN ('laboratorio', 'ingenieria')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evitar duplicados por nombre/area (case-insensitive en nombre)
CREATE UNIQUE INDEX IF NOT EXISTS uq_services_name_area ON services (LOWER(name), area);

-- Tabla de subservicios (versión completa)
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

-- Índices para búsqueda inteligente
CREATE INDEX IF NOT EXISTS idx_subservices_codigo ON subservices(codigo);
CREATE INDEX IF NOT EXISTS idx_subservices_descripcion ON subservices USING gin(to_tsvector('spanish', descripcion));
CREATE INDEX IF NOT EXISTS idx_subservices_service_id ON subservices(service_id);
CREATE INDEX IF NOT EXISTS idx_subservices_active ON subservices(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_subservices_updated_at' 
        AND event_object_table = 'subservices'
    ) THEN
        CREATE TRIGGER update_subservices_updated_at 
            BEFORE UPDATE ON subservices 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Relación de servicios prestados a proyectos
CREATE TABLE IF NOT EXISTS project_services (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subservice_id INTEGER NOT NULL REFERENCES subservices(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  provided_by INTEGER REFERENCES users(id),
  provided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
