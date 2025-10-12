-- Migración para agregar columna updated_at a la tabla companies
-- Fecha: 2025-01-11

-- Agregar columna updated_at a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a la tabla companies
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario sobre la columna
COMMENT ON COLUMN companies.updated_at IS 'Fecha y hora de la última actualización del registro';
