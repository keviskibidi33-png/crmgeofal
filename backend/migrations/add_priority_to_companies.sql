-- Migración para agregar columna priority a la tabla companies
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';

-- Opcional: Añadir comentario a la columna
COMMENT ON COLUMN companies.priority IS 'Prioridad del cliente: urgent, high, normal, low';
