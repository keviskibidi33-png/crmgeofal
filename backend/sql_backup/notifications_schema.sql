-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'quote_assigned', 'project_completed', 'ticket_created', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Datos adicionales como IDs de proyectos, cotizaciones, etc.
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Comentarios en la tabla
COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios del CRM';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: quote_assigned, project_completed, ticket_created, etc.';
COMMENT ON COLUMN notifications.data IS 'Datos adicionales en formato JSON para contexto de la notificación';
COMMENT ON COLUMN notifications.priority IS 'Prioridad: low, normal, high, urgent';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp cuando la notificación fue leída (NULL = no leída)';
