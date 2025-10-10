-- Tabla para almacenar evidencias de cotizaciones
-- Cada cotización puede tener múltiples evidencias en 3 categorías:
-- 1. Primer contacto
-- 2. Aceptación
-- 3. Finalización

-- Crear tipo ENUM para las categorías de evidencias
DO $$ BEGIN
  CREATE TYPE evidence_type_enum AS ENUM ('primer_contacto', 'aceptacion', 'finalizacion');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS quote_evidences (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL,
  evidence_type evidence_type_enum NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  uploaded_by INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  CONSTRAINT fk_quote_evidences_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  CONSTRAINT fk_quote_evidences_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_quote_evidences_quote_id ON quote_evidences(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_evidences_evidence_type ON quote_evidences(evidence_type);
CREATE INDEX IF NOT EXISTS idx_quote_evidences_uploaded_by ON quote_evidences(uploaded_by);

-- Comentarios en la tabla
COMMENT ON TABLE quote_evidences IS 'Almacena evidencias adjuntas a las cotizaciones';
COMMENT ON COLUMN quote_evidences.evidence_type IS 'Tipo de evidencia: primer_contacto, aceptacion, finalizacion';
COMMENT ON COLUMN quote_evidences.file_name IS 'Nombre original del archivo';
COMMENT ON COLUMN quote_evidences.file_path IS 'Ruta del archivo en el servidor';
COMMENT ON COLUMN quote_evidences.file_type IS 'Tipo MIME del archivo (PDF, Excel, imagen)';
COMMENT ON COLUMN quote_evidences.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN quote_evidences.uploaded_by IS 'ID del usuario que subió la evidencia';
COMMENT ON COLUMN quote_evidences.notes IS 'Notas o comentarios sobre la evidencia';

