-- =============================================
-- SISTEMA DE APROBACIONES Y MÉTRICAS DE EMBUDO
-- =============================================

-- Tabla de versiones de cotizaciones
CREATE TABLE IF NOT EXISTS quote_versions (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    data_snapshot JSONB NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_restoration BOOLEAN DEFAULT FALSE,
    UNIQUE(quote_id, version_number)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (status IN ('sent', 'in_review', 'approved', 'rejected'))
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (priority IN ('low', 'medium', 'high')),
    CHECK (status IN ('pending', 'sent', 'read', 'failed'))
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_quote_versions_quote_id ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_created_at ON quote_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_quote_approvals_quote_id ON quote_approvals(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_status ON quote_approvals(status);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_requested_by ON quote_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_approved_by ON quote_approvals(approved_by);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_created_at ON quote_approvals(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- Actualizar tabla quotes para incluir campo cloned_from
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS cloned_from INTEGER REFERENCES quotes(id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_quote_approvals_updated_at ON quote_approvals;
CREATE TRIGGER update_quote_approvals_updated_at 
    BEFORE UPDATE ON quote_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para métricas de embudo (solo para Jefe Comercial)
CREATE OR REPLACE VIEW funnel_metrics_view AS
SELECT 
    qa.id as approval_id,
    qa.quote_id,
    q.quote_number,
    q.total_amount,
    q.subtotal,
    q.igv,
    qa.approved_at,
    p.name as project_name,
    c.name as company_name,
    c.ruc as company_ruc,
    requester.name as requested_by_name,
    approver.name as approved_by_name,
    qi.subservice_id,
    ss.name as service_name,
    ss.codigo as service_code,
    ss.precio as service_price,
    qi.quantity,
    qi.unit_price,
    qi.total_price
FROM quote_approvals qa
JOIN quotes q ON qa.quote_id = q.id
LEFT JOIN projects p ON q.project_id = p.id
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users requester ON qa.requested_by = requester.id
LEFT JOIN users approver ON qa.approved_by = approver.id
LEFT JOIN quote_items qi ON q.id = qi.quote_id
LEFT JOIN subservices ss ON qi.subservice_id = ss.id
WHERE qa.status = 'approved';

-- Función para obtener estadísticas de embudo
CREATE OR REPLACE FUNCTION get_funnel_stats(
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_quotes BIGINT,
    total_revenue NUMERIC,
    avg_quote_value NUMERIC,
    unique_companies BIGINT,
    unique_services BIGINT,
    top_service_name TEXT,
    top_service_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT fmv.quote_id) as total_quotes,
            SUM(fmv.total_amount) as total_revenue,
            AVG(fmv.total_amount) as avg_quote_value,
            COUNT(DISTINCT fmv.company_ruc) as unique_companies,
            COUNT(DISTINCT fmv.subservice_id) as unique_services
        FROM funnel_metrics_view fmv
        WHERE (start_date IS NULL OR fmv.approved_at >= start_date)
          AND (end_date IS NULL OR fmv.approved_at <= end_date)
    ),
    top_service AS (
        SELECT 
            service_name,
            SUM(total_price) as service_revenue
        FROM funnel_metrics_view fmv
        WHERE (start_date IS NULL OR fmv.approved_at >= start_date)
          AND (end_date IS NULL OR fmv.approved_at <= end_date)
        GROUP BY service_name
        ORDER BY service_revenue DESC
        LIMIT 1
    )
    SELECT 
        s.total_quotes,
        s.total_revenue,
        s.avg_quote_value,
        s.unique_companies,
        s.unique_services,
        ts.service_name,
        ts.service_revenue
    FROM stats s
    CROSS JOIN top_service ts;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de ejemplo para roles
INSERT INTO users (name, email, role, password_hash) VALUES 
('Usuario Facturación', 'facturacion@crmgeofal.com', 'facturacion', '$2b$10$example'),
('Jefe Comercial', 'jefe.comercial@crmgeofal.com', 'jefe_comercial', '$2b$10$example')
ON CONFLICT (email) DO NOTHING;

-- Comentarios para documentación
COMMENT ON TABLE quote_versions IS 'Versiones históricas de cotizaciones para control de cambios';
COMMENT ON TABLE quote_approvals IS 'Sistema de aprobaciones con flujo diferenciado por roles';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones multicanal (email, websocket, database)';
COMMENT ON VIEW funnel_metrics_view IS 'Vista optimizada para métricas de embudo del Jefe Comercial';
COMMENT ON FUNCTION get_funnel_stats IS 'Función para obtener estadísticas de embudo con filtros de fecha';
