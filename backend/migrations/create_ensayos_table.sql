-- Crear tabla de ensayos
CREATE TABLE IF NOT EXISTS ensayos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    norma VARCHAR(100),
    referencia_otra_norma VARCHAR(100),
    ubicacion VARCHAR(50) CHECK (ubicacion IN ('LABORATORIO', 'CAMPO')),
    precio DECIMAL(10,2) DEFAULT 0.00,
    comentarios TEXT,
    nota_comercial TEXT,
    categoria VARCHAR(100),
    ensayos_requeridos TEXT, -- Códigos separados por comas
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_ensayos_codigo ON ensayos(codigo);
CREATE INDEX IF NOT EXISTS idx_ensayos_categoria ON ensayos(categoria);
CREATE INDEX IF NOT EXISTS idx_ensayos_ubicacion ON ensayos(ubicacion);
CREATE INDEX IF NOT EXISTS idx_ensayos_activo ON ensayos(is_active);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_ensayos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ensayos_updated_at
    BEFORE UPDATE ON ensayos
    FOR EACH ROW
    EXECUTE FUNCTION update_ensayos_updated_at();
