-- Tabla para rastrear limpiezas automáticas
CREATE TABLE IF NOT EXISTS audit_cleanup_log (
  id SERIAL PRIMARY KEY,
  cleanup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  hours_threshold INTEGER NOT NULL,
  deleted_count INTEGER NOT NULL,
  total_before INTEGER NOT NULL,
  total_after INTEGER NOT NULL,
  executed_by INTEGER REFERENCES users(id),
  notes TEXT
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_cleanup_date ON audit_cleanup_log(cleanup_date);

-- Función para obtener la última limpieza
CREATE OR REPLACE FUNCTION get_last_cleanup()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN (
    SELECT cleanup_date 
    FROM audit_cleanup_log 
    ORDER BY cleanup_date DESC 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;
