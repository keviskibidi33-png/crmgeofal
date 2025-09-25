const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function generateCompleteDatabaseSQL() {
  console.log('🔧 Generando archivo SQL completo de la base de datos...');
  
  try {
    let sqlContent = `-- =====================================================
-- CRM GEOFAL - BASE DE DATOS COMPLETA
-- Generado automáticamente el ${new Date().toLocaleString()}
-- =====================================================

-- Configuración inicial
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

`;

    // Obtener estructura de todas las tablas
    const tables = [
      'users', 'companies', 'categories', 'subcategories', 
      'services', 'subservices', 'projects', 'project_categories',
      'project_subcategories', 'project_services', 'quotes',
      'quote_items', 'quote_variants', 'invoices', 'leads',
      'activities', 'notifications', 'tickets', 'ticket_history',
      'project_history', 'project_attachments', 'evidences',
      'export_history', 'audit_log', 'audit_cleanup_log',
      'audit_quotes', 'monthly_goals'
    ];

    for (const tableName of tables) {
      console.log(`📋 Procesando tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const structureQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          character_set_name,
          collation_name
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      const structureResult = await pool.query(structureQuery, [tableName]);
      
      if (structureResult.rows.length > 0) {
        sqlContent += `-- =====================================================
-- TABLA: ${tableName.toUpperCase()}
-- =====================================================
CREATE TABLE IF NOT EXISTS ${tableName} (
`;

        // Agregar columnas
        for (const column of structureResult.rows) {
          let columnDef = `  ${column.column_name} ${column.data_type}`;
          
          if (column.character_maximum_length) {
            columnDef += `(${column.character_maximum_length})`;
          }
          
          if (column.is_nullable === 'NO') {
            columnDef += ' NOT NULL';
          }
          
          if (column.column_default) {
            columnDef += ` DEFAULT ${column.column_default}`;
          }
          
          sqlContent += columnDef + ',\n';
        }
        
        // Obtener constraints
        const constraintsQuery = `
          SELECT 
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          LEFT JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.table_name = $1 AND tc.table_schema = 'public'
        `;
        
        const constraintsResult = await pool.query(constraintsQuery, [tableName]);
        
        for (const constraint of constraintsResult.rows) {
          if (constraint.constraint_type === 'PRIMARY KEY') {
            sqlContent += `  PRIMARY KEY (${constraint.column_name}),\n`;
          } else if (constraint.constraint_type === 'FOREIGN KEY') {
            sqlContent += `  FOREIGN KEY (${constraint.column_name}) REFERENCES ${constraint.foreign_table_name}(${constraint.foreign_column_name}),\n`;
          } else if (constraint.constraint_type === 'UNIQUE') {
            sqlContent += `  UNIQUE (${constraint.column_name}),\n`;
          }
        }
        
        // Remover la última coma
        sqlContent = sqlContent.replace(/,\n$/, '\n');
        sqlContent += `);

`;

        // Obtener índices
        const indexesQuery = `
          SELECT 
            indexname,
            indexdef
          FROM pg_indexes 
          WHERE tablename = $1 AND schemaname = 'public'
        `;
        
        const indexesResult = await pool.query(indexesQuery, [tableName]);
        
        for (const index of indexesResult.rows) {
          if (!index.indexdef.includes('PRIMARY KEY') && !index.indexdef.includes('UNIQUE')) {
            sqlContent += `-- Índice: ${index.indexname}\n`;
            sqlContent += `${index.indexdef};\n\n`;
          }
        }
      }
    }

    // Agregar datos de ejemplo
    sqlContent += `-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Usuarios de ejemplo
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(1, 'Admin Sistema', 'admin@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'admin', NOW(), NOW()),
(2, 'Vendedor Test', 'vendedor@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'seller', NOW(), NOW()),
(3, 'Laboratorio Test', 'laboratorio@crmgeofal.com', '$2b$10$rQZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8KjZ8K', 'laboratory', NOW(), NOW());

-- Empresas de ejemplo
INSERT INTO companies (id, type, name, ruc, dni, address, email, phone, contact_name, city, sector, created_at, updated_at) VALUES
(1, 'empresa', 'Empresa Constructora ABC S.A.C.', '20123456789', NULL, 'Av. Principal 123, Lima', 'contacto@abc.com', '987654321', 'Juan Pérez', 'Lima', 'Construcción', NOW(), NOW()),
(2, 'persona_natural', 'María González', NULL, '12345678', 'Jr. Las Flores 456, Arequipa', 'maria@email.com', '987654322', 'María González', 'Arequipa', 'Ingeniería', NOW(), NOW());

-- Servicios principales
INSERT INTO services (id, name, area, description, created_at, updated_at) VALUES
(1, 'ENSAYO ESTÁNDAR', 'laboratorio', 'Ensayos de suelos estándar', NOW(), NOW()),
(2, 'ENSAYOS ESPECIALES', 'laboratorio', 'Ensayos de suelos especiales', NOW(), NOW()),
(3, 'ENSAYO AGREGADO', 'laboratorio', 'Ensayos para agregados', NOW(), NOW()),
(4, 'ENSAYOS DE CAMPO', 'laboratorio', 'Ensayos realizados en campo', NOW(), NOW()),
(5, 'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO', 'laboratorio', 'Ensayos químicos para suelo y agua subterránea', NOW(), NOW()),
(6, 'ENSAYO QUÍMICO AGREGADO', 'laboratorio', 'Ensayos químicos para agregados', NOW(), NOW()),
(7, 'ENSAYO CONCRETO', 'laboratorio', 'Ensayos para concreto', NOW(), NOW()),
(8, 'ENSAYO ALBAÑILERÍA', 'laboratorio', 'Ensayos para albañilería', NOW(), NOW()),
(9, 'ENSAYO ROCA', 'laboratorio', 'Ensayos para roca', NOW(), NOW()),
(10, 'CEMENTO', 'laboratorio', 'Ensayos para cemento', NOW(), NOW()),
(11, 'ENSAYO PAVIMENTO', 'laboratorio', 'Ensayos para pavimentos', NOW(), NOW()),
(12, 'ENSAYO ASFALTO', 'laboratorio', 'Ensayos para asfalto', NOW(), NOW()),
(13, 'ENSAYO MEZCLA ASFÁLTICO', 'laboratorio', 'Ensayos para mezclas asfálticas', NOW(), NOW()),
(14, 'EVALUACIONES ESTRUCTURALES', 'laboratorio', 'Evaluaciones estructurales', NOW(), NOW()),
(15, 'IMPLEMENTACIÓN LABORATORIO EN OBRA', 'laboratorio', 'Implementación de laboratorio en obra', NOW(), NOW()),
(16, 'OTROS SERVICIOS', 'laboratorio', 'Otros servicios de laboratorio', NOW(), NOW()),
(17, 'INGENIERÍA', 'ingenieria', 'Servicios de ingeniería', NOW(), NOW());

-- =====================================================
-- FIN DEL ARCHIVO
-- =====================================================
`;

    // Escribir archivo
    const filePath = path.join(__dirname, '..', 'database_schema_complete.sql');
    fs.writeFileSync(filePath, sqlContent);
    
    console.log(`✅ Archivo SQL generado exitosamente: ${filePath}`);
    console.log(`📊 Tamaño del archivo: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
    
    // Mostrar resumen
    const lines = sqlContent.split('\n').length;
    console.log(`📝 Líneas totales: ${lines}`);
    
    console.log('\n🎉 ¡Base de datos completa exportada exitosamente!');
    console.log('📁 Archivo: database_schema_complete.sql');
    console.log('🚀 Listo para respaldo o migración');

  } catch (error) {
    console.error('❌ Error generando archivo SQL:', error);
  } finally {
    pool.end();
  }
}

generateCompleteDatabaseSQL();
