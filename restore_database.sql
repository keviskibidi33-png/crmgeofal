-- Script de Restauración Completa - CRM GEOFAL
-- Ejecutar con: psql -h localhost -U admin -d postgres -f restore_database.sql

-- Crear esquemas en orden
\i backend/schemas/00_init.sql
\i backend/schemas/01_crm_schema.sql
\i backend/schemas/02_quotes_schema.sql
\i backend/schemas/03_audit_schema.sql
\i backend/schemas/activities_schema.sql
\i backend/schemas/audit_cleanup_tracking.sql
\i backend/schemas/evidences_schema.sql
\i backend/schemas/exports_schema.sql
\i backend/schemas/invoices_schema.sql
\i backend/schemas/leads_schema.sql
\i backend/schemas/monthly_goals_schema.sql
\i backend/schemas/notifications_schema.sql
\i backend/schemas/services_schema.sql
\i backend/schemas/subservices_schema.sql
\i backend/schemas/tickets_schema.sql
\i backend/schemas/update_export_history_schema.sql
\i backend/schemas/update_project_attachments.sql
\i backend/schemas/update_quotes_schema.sql

-- Insertar usuario administrador
INSERT INTO users (username, email, password, name, role) VALUES 
('admin', 'admin@geofal.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', 'Administrador', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insertar servicios principales
INSERT INTO services (name, description, category) VALUES 
('ENSAYO ESTÁNDAR', 'Ensayos estándar de laboratorio', 'Laboratorio'),
('ENSAYOS ESPECIALES', 'Ensayos especializados', 'Laboratorio'),
('ENSAYO AGREGADO', 'Ensayos de agregados', 'Laboratorio'),
('ENSAYOS DE CAMPO', 'Ensayos en campo', 'Campo'),
('ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', 'Análisis químico', 'Laboratorio'),
('ENSAYO QUÍMICO AGREGADO', 'Análisis químico de agregados', 'Laboratorio'),
('ENSAYO CONCRETO', 'Ensayos de concreto', 'Laboratorio'),
('ENSAYO ALBAÑILERÍA', 'Ensayos de albañilería', 'Laboratorio'),
('ENSAYO ROCA', 'Ensayos de roca', 'Laboratorio'),
('CEMENTO', 'Ensayos de cemento', 'Laboratorio'),
('ENSAYO PAVIMENTO', 'Ensayos de pavimento', 'Laboratorio'),
('ENSAYO ASFALTO', 'Ensayos de asfalto', 'Laboratorio'),
('ENSAYO MEZCLA ASFÁLTICO', 'Ensayos de mezcla asfáltica', 'Laboratorio'),
('EVALUACIONES ESTRUCTURALES', 'Evaluaciones estructurales', 'Campo'),
('IMPLEMENTACIÓN LABORATORIO EN OBRA', 'Implementación de laboratorio', 'Campo'),
('OTROS SERVICIOS', 'Servicios adicionales', 'General')
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
SELECT 'Base de datos restaurada exitosamente' AS status;
