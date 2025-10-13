-- Migración para agregar columnas actividad y servicios a la tabla companies
-- Fecha: 2025-01-13

-- Agregar columna actividad
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS actividad TEXT;

-- Agregar columna servicios
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS servicios TEXT;

-- Crear índices para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_companies_actividad ON companies(actividad);
CREATE INDEX IF NOT EXISTS idx_companies_servicios ON companies(servicios);

-- Comentarios sobre las columnas
COMMENT ON COLUMN companies.actividad IS 'Descripción de la actividad principal de la empresa';
COMMENT ON COLUMN companies.servicios IS 'Servicios que ofrece la empresa o servicios requeridos';
