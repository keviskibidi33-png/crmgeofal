-- Script para agregar sistema de numeración secuencial a cotizaciones
-- Ejecutar este script para implementar numeración automática de cotizaciones

-- Agregar columna para número de cotización
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50) UNIQUE;

-- Crear secuencia para numeración automática
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

-- Función para generar número de cotización automático
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    quote_num VARCHAR(50);
BEGIN
    -- Obtener año actual
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Obtener siguiente número de secuencia
    sequence_num := nextval('quote_number_seq');
    
    -- Formato: COT-YYYY-NNNN (ej: COT-2025-0001)
    quote_num := 'COT-' || year_part || '-' || LPAD(sequence_num::VARCHAR, 4, '0');
    
    -- Asignar número generado
    NEW.quote_number := quote_num;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para generar número automáticamente
DROP TRIGGER IF EXISTS trigger_generate_quote_number ON quotes;
CREATE TRIGGER trigger_generate_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
    EXECUTE FUNCTION generate_quote_number();

-- Actualizar cotizaciones existentes que no tengan número
UPDATE quotes 
SET quote_number = 'COT-' || EXTRACT(YEAR FROM created_at)::VARCHAR || '-' || LPAD(id::VARCHAR, 4, '0')
WHERE quote_number IS NULL OR quote_number = '';

-- Crear índice para búsquedas rápidas por número
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Comentarios para documentación
COMMENT ON COLUMN quotes.quote_number IS 'Número único de cotización (formato: COT-YYYY-NNNN)';
COMMENT ON SEQUENCE quote_number_seq IS 'Secuencia para numeración automática de cotizaciones';
