-- =====================================================
-- SCRIPT DE EJECUCIÓN COMPLETA DEL SCHEMA CRMGeoFal
-- =====================================================
-- Este script ejecuta todas las tablas en el orden correcto
-- Uso: psql -d tu_database -f execute_schema.sql

-- Verificar conexión
SELECT 'Iniciando creación de esquema CRMGeoFal...' as status;

-- Ejecutar el esquema completo
\i complete_schema.sql

-- Verificar que todas las tablas se crearon
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'companies', 'projects', 'categories', 'subcategories',
        'services', 'subservices', 'quote_variants', 'quotes', 'quote_items',
        'project_attachments', 'project_history', 'project_services',
        'project_whatsapp_notices', 'tickets', 'ticket_history',
        'leads', 'invoices', 'evidences', 'activities', 'notifications',
        'monthly_goals', 'audit_log', 'audit_quotes', 'audit_cleanup_log',
        'export_history', 'project_categories', 'project_subcategories'
    )
ORDER BY tablename;

-- Mostrar resumen
SELECT 
    COUNT(*) as total_tables,
    'Tablas creadas exitosamente' as message
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'companies', 'projects', 'categories', 'subcategories',
        'services', 'subservices', 'quote_variants', 'quotes', 'quote_items',
        'project_attachments', 'project_history', 'project_services',
        'project_whatsapp_notices', 'tickets', 'ticket_history',
        'leads', 'invoices', 'evidences', 'activities', 'notifications',
        'monthly_goals', 'audit_log', 'audit_quotes', 'audit_cleanup_log',
        'export_history', 'project_categories', 'project_subcategories'
    );

SELECT 'Esquema CRMGeoFal creado exitosamente!' as final_status;
