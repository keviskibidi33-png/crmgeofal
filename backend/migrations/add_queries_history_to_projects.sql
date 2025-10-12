-- Migración para agregar columna queries_history a la tabla projects
-- Fecha: 2025-01-11

-- Agregar columna queries_history a la tabla projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS queries_history TEXT;

-- Comentario sobre la columna
COMMENT ON COLUMN projects.queries_history IS 'Historial de consultas del proyecto en formato JSON';
