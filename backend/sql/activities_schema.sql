-- Tabla de actividades recientes
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'quote_created', 'project_completed', 'ticket_created', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50), -- 'quote', 'project', 'ticket', 'user', etc.
    entity_id INTEGER, -- ID de la entidad relacionada
    metadata JSONB, -- Datos adicionales como nombres, estados, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at);

-- Comentarios en la tabla
COMMENT ON TABLE activities IS 'Registro de actividades recientes del sistema CRM';
COMMENT ON COLUMN activities.type IS 'Tipo de actividad: quote_created, project_completed, ticket_created, etc.';
COMMENT ON COLUMN activities.entity_type IS 'Tipo de entidad relacionada: quote, project, ticket, user, etc.';
COMMENT ON COLUMN activities.entity_id IS 'ID de la entidad relacionada con la actividad';
COMMENT ON COLUMN activities.metadata IS 'Datos adicionales en formato JSON para contexto de la actividad';
