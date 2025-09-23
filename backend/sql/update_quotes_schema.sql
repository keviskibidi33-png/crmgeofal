-- Script para actualizar la tabla quotes con las columnas faltantes
-- Ejecutar este script para agregar las columnas necesarias para la funcionalidad de cotizaciones

-- Agregar columnas faltantes para cotizaciones
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS variant_id INTEGER REFERENCES quote_variants(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_contact VARCHAR(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_email VARCHAR(100);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_phone VARCHAR(30);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS total NUMERIC(12,2);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'borrador';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_issue_date ON quotes(issue_date);
CREATE INDEX IF NOT EXISTS idx_quotes_updated_at ON quotes(updated_at);

-- Actualizar registros existentes para que tengan valores por defecto
UPDATE quotes 
SET 
  status = 'borrador',
  issue_date = created_at::date,
  total = COALESCE(subtotal, 0) + COALESCE(igv, 0),
  updated_at = created_at
WHERE status IS NULL OR issue_date IS NULL OR total IS NULL;

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN quotes.variant_id IS 'ID de la variante/plantilla de cotización';
COMMENT ON COLUMN quotes.created_by IS 'ID del usuario que creó la cotización';
COMMENT ON COLUMN quotes.client_contact IS 'Nombre del contacto del cliente';
COMMENT ON COLUMN quotes.client_email IS 'Email del cliente';
COMMENT ON COLUMN quotes.client_phone IS 'Teléfono del cliente';
COMMENT ON COLUMN quotes.issue_date IS 'Fecha de emisión de la cotización';
COMMENT ON COLUMN quotes.total IS 'Total de la cotización (subtotal + IGV)';
COMMENT ON COLUMN quotes.status IS 'Estado de la cotización (borrador, enviada, aprobada, rechazada, cancelada)';
COMMENT ON COLUMN quotes.updated_at IS 'Fecha y hora de la última actualización del registro';
