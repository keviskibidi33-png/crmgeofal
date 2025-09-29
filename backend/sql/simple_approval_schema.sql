-- Esquema simplificado para sistema de aprobaciones
-- Aplicar solo las tablas esenciales

-- Tabla de versiones de cotizaciones
CREATE TABLE IF NOT EXISTS quote_versions (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data_snapshot JSONB NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_restoration BOOLEAN DEFAULT FALSE
);

-- Tabla de solicitudes de aprobación
CREATE TABLE IF NOT EXISTS quote_approvals (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    requested_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    request_data JSONB,
    approval_data JSONB,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    sender_id INTEGER REFERENCES users(id),
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    priority VARCHAR(20) DEFAULT 'medium',
    channels JSONB DEFAULT '["database"]',
    status VARCHAR(20) DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    websocket_sent BOOLEAN DEFAULT FALSE,
    websocket_sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar campo cloned_from a quotes si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'cloned_from') THEN
        ALTER TABLE quotes ADD COLUMN cloned_from INTEGER REFERENCES quotes(id);
    END IF;
END $$;

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_quote_versions_quote_id ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_quote_id ON quote_approvals(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_status ON quote_approvals(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
