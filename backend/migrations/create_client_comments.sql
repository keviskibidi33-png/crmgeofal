-- Crear tabla para comentarios de vendedores en historial de clientes
CREATE TABLE IF NOT EXISTS client_comments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_client_comments_company_id ON client_comments(company_id);
CREATE INDEX IF NOT EXISTS idx_client_comments_user_id ON client_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_client_comments_created_at ON client_comments(created_at);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_client_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_comments_updated_at
    BEFORE UPDATE ON client_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_client_comments_updated_at();
