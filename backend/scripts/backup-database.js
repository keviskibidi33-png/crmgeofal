const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function createDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
  
  try {
    console.log('🔄 CREANDO COPIA DE SEGURIDAD DE LA BASE DE DATOS...\n');
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Directorio de backups creado');
    }
    
    // 1. Obtener información de la base de datos
    console.log('1️⃣ Obteniendo información de la base de datos...');
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as postgres_version,
        now() as backup_time
    `);
    
    console.log(`   📊 Base de datos: ${dbInfo.rows[0].database_name}`);
    console.log(`   👤 Usuario: ${dbInfo.rows[0].current_user}`);
    console.log(`   🕐 Fecha: ${dbInfo.rows[0].backup_time}`);
    
    // 2. Obtener todas las tablas
    console.log('\n2️⃣ Obteniendo estructura de tablas...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   📋 Encontradas ${tables.rows.length} tablas:`);
    tables.rows.forEach(table => {
      console.log(`      - ${table.table_name}`);
    });
    
    // 3. Crear backup SQL
    console.log('\n3️⃣ Creando archivo de backup...');
    let backupContent = `-- BACKUP DE BASE DE DATOS GEOFAL CRM
-- Fecha: ${new Date().toLocaleString()}
-- Base de datos: ${dbInfo.rows[0].database_name}
-- Usuario: ${dbInfo.rows[0].current_user}
-- PostgreSQL: ${dbInfo.rows[0].postgres_version}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- =============================================
-- ESTRUCTURA DE TABLAS
-- =============================================

`;
    
    // 4. Obtener estructura de cada tabla
    for (const table of tables.rows) {
      const tableName = table.table_name;
      console.log(`   🔍 Procesando tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const tableStructure = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Obtener datos de la tabla
      const tableData = await pool.query(`SELECT * FROM ${tableName}`);
      
      backupContent += `-- =============================================
-- TABLA: ${tableName.toUpperCase()}
-- =============================================

-- Estructura de la tabla
CREATE TABLE IF NOT EXISTS ${tableName} (
`;
      
      // Agregar columnas
      tableStructure.rows.forEach((col, index) => {
        let columnDef = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          columnDef += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          columnDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }
        
        backupContent += columnDef;
        if (index < tableStructure.rows.length - 1) {
          backupContent += ',';
        }
        backupContent += '\n';
      });
      
      backupContent += `);

-- Datos de la tabla (${tableData.rows.length} registros)
`;
      
      // Agregar datos
      if (tableData.rows.length > 0) {
        const columns = tableStructure.rows.map(col => col.column_name);
        const columnNames = columns.join(', ');
        
        tableData.rows.forEach(row => {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            return value;
          });
          
          backupContent += `INSERT INTO ${tableName} (${columnNames}) VALUES (${values.join(', ')});\n`;
        });
      }
      
      backupContent += '\n';
    }
    
    // 5. Escribir archivo de backup
    fs.writeFileSync(backupFile, backupContent, 'utf8');
    console.log(`\n✅ Backup creado exitosamente: ${backupFile}`);
    
    // 6. Verificar tamaño del archivo
    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   📊 Tamaño del archivo: ${fileSizeInMB} MB`);
    
    // 7. Mostrar resumen de datos
    console.log('\n4️⃣ Resumen de datos en el backup:');
    for (const table of tables.rows) {
      const tableName = table.table_name;
      const count = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   ${tableName}: ${count.rows[0].count} registros`);
    }
    
    console.log('\n🎉 BACKUP COMPLETADO EXITOSAMENTE');
    console.log(`📁 Archivo guardado en: ${backupFile}`);
    console.log('✅ Base de datos respaldada correctamente');
    
  } catch (error) {
    console.error('❌ Error creando backup:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createDatabaseBackup();
