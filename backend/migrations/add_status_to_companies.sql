-- Migración para agregar columna status a la tabla companies
-- Fecha: 2025-01-11

-- Agregar columna status a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'prospeccion';

-- Crear índice para mejorar performance en consultas por status
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Actualizar registros existentes con un estado por defecto
UPDATE companies 
SET status = 'prospeccion' 
WHERE status IS NULL;

-- Comentario sobre los estados disponibles
COMMENT ON COLUMN companies.status IS 'Estado del cliente: prospeccion, interesado, pendiente_cotizacion, cotizacion_enviada, negociacion, ganado, perdido';
