-- Script para actualizar la tabla project_attachments con los campos faltantes
-- Ejecutar este script para agregar las columnas necesarias para la funcionalidad de edición

-- Agregar columnas para categorías
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES project_categories(id);
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES project_subcategories(id);

-- Agregar columnas para servicios requeridos
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS requiere_laboratorio BOOLEAN DEFAULT FALSE;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS requiere_ingenieria BOOLEAN DEFAULT FALSE;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS requiere_consultoria BOOLEAN DEFAULT FALSE;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS requiere_capacitacion BOOLEAN DEFAULT FALSE;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS requiere_auditoria BOOLEAN DEFAULT FALSE;

-- Agregar columnas para información del archivo
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS original_name TEXT;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);

-- Agregar columna de actualización
ALTER TABLE project_attachments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_project_attachments_category ON project_attachments(category_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_subcategory ON project_attachments(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_project_attachments_updated_at ON project_attachments(updated_at);

-- Actualizar registros existentes para que tengan valores por defecto
UPDATE project_attachments 
SET 
  requiere_laboratorio = FALSE,
  requiere_ingenieria = FALSE,
  requiere_consultoria = FALSE,
  requiere_capacitacion = FALSE,
  requiere_auditoria = FALSE,
  updated_at = created_at
WHERE updated_at IS NULL;

-- Comentarios para documentar las nuevas columnas
COMMENT ON COLUMN project_attachments.category_id IS 'ID de la categoría del proyecto asignada al archivo';
COMMENT ON COLUMN project_attachments.subcategory_id IS 'ID de la subcategoría del proyecto asignada al archivo';
COMMENT ON COLUMN project_attachments.requiere_laboratorio IS 'Indica si el archivo requiere servicios de laboratorio';
COMMENT ON COLUMN project_attachments.requiere_ingenieria IS 'Indica si el archivo requiere servicios de ingeniería';
COMMENT ON COLUMN project_attachments.requiere_consultoria IS 'Indica si el archivo requiere servicios de consultoría';
COMMENT ON COLUMN project_attachments.requiere_capacitacion IS 'Indica si el archivo requiere servicios de capacitación';
COMMENT ON COLUMN project_attachments.requiere_auditoria IS 'Indica si el archivo requiere servicios de auditoría';
COMMENT ON COLUMN project_attachments.file_path IS 'Ruta completa del archivo en el sistema de archivos';
COMMENT ON COLUMN project_attachments.original_name IS 'Nombre original del archivo cuando fue subido';
COMMENT ON COLUMN project_attachments.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN project_attachments.mime_type IS 'Tipo MIME del archivo';
COMMENT ON COLUMN project_attachments.updated_at IS 'Fecha y hora de la última actualización del registro';
