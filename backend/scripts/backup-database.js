const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.PGUSER || 'admin',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  port: process.env.PGPORT || 5432,
});

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(__dirname, '..', 'backups');
  
  // Crear directorio si no existe
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    console.log('🔄 Iniciando backup completo de la base de datos...');
    
    // Backup completo
    const fullBackupFile = path.join(backupDir, `BACKUP_COMPLETO_${timestamp}.sql`);
    await createFullBackup(fullBackupFile);
    
    // Backup específico de subservicios
    const subservicesBackupFile = path.join(backupDir, `SUBSERVICIOS_${timestamp}.sql`);
    await createSubservicesBackup(subservicesBackupFile);
    
    // Backup de estructura de tablas
    const schemaBackupFile = path.join(backupDir, `SCHEMA_${timestamp}.sql`);
    await createSchemaBackup(schemaBackupFile);
    
    console.log('✅ Backup completado exitosamente');
    console.log(`📁 Archivos creados:`);
    console.log(`   - ${fullBackupFile}`);
    console.log(`   - ${subservicesBackupFile}`);
    console.log(`   - ${schemaBackupFile}`);
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
  } finally {
    await pool.end();
  }
}

async function createFullBackup(filePath) {
  const client = await pool.connect();
  try {
    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    let sqlContent = `-- BACKUP COMPLETO DE LA BASE DE DATOS CRM
-- Fecha: ${new Date().toISOString()}
-- Generado automáticamente

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

    // Para cada tabla, obtener estructura y datos
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Estructura de la tabla
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      sqlContent += `\n-- Estructura de la tabla ${tableName}\n`;
      sqlContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columns = structureResult.rows.map(col => {
        let def = `${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      
      sqlContent += columns.join(',\n') + '\n);\n';
      
      // Datos de la tabla
      const dataResult = await client.query(`SELECT * FROM ${tableName}`);
      if (dataResult.rows.length > 0) {
        sqlContent += `\n-- Datos de la tabla ${tableName}\n`;
        sqlContent += `INSERT INTO ${tableName} VALUES\n`;
        
        const values = dataResult.rows.map(row => {
          const rowValues = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          });
          return `(${rowValues.join(', ')})`;
        });
        
        sqlContent += values.join(',\n') + ';\n';
      }
    }
    
    fs.writeFileSync(filePath, sqlContent, 'utf8');
    console.log(`✅ Backup completo guardado en: ${filePath}`);
    
  } finally {
    client.release();
  }
}

async function createSubservicesBackup(filePath) {
  const client = await pool.connect();
  try {
    let sqlContent = `-- BACKUP ESPECÍFICO DE SUBSERVICIOS
-- Fecha: ${new Date().toISOString()}
-- Tabla: subservices

`;

    // Estructura de la tabla subservices
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'subservices' 
      ORDER BY ordinal_position
    `);
    
    if (structureResult.rows.length > 0) {
      sqlContent += `CREATE TABLE IF NOT EXISTS subservices (\n`;
      const columns = structureResult.rows.map(col => {
        let def = `${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      sqlContent += columns.join(',\n') + '\n);\n';
      
      // Datos de subservicios
      const dataResult = await client.query('SELECT * FROM subservices ORDER BY id');
      if (dataResult.rows.length > 0) {
        sqlContent += `\n-- Datos de subservicios (${dataResult.rows.length} registros)\n`;
        sqlContent += `INSERT INTO subservices VALUES\n`;
        
        const values = dataResult.rows.map(row => {
          const rowValues = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
          });
          return `(${rowValues.join(', ')})`;
        });
        
        sqlContent += values.join(',\n') + ';\n';
      }
    }
    
    fs.writeFileSync(filePath, sqlContent, 'utf8');
    console.log(`✅ Backup de subservicios guardado en: ${filePath}`);
    
  } finally {
    client.release();
  }
}

async function createSchemaBackup(filePath) {
  const client = await pool.connect();
  try {
    let sqlContent = `-- BACKUP DE ESQUEMA DE BASE DE DATOS
-- Fecha: ${new Date().toISOString()}
-- Solo estructura de tablas

`;

    // Obtener todas las tablas con sus estructuras
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      sqlContent += `\n-- Tabla: ${tableName}\n`;
      sqlContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columns = structureResult.rows.map(col => {
        let def = `${col.column_name} ${col.data_type}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      });
      
      sqlContent += columns.join(',\n') + '\n);\n';
    }
    
    fs.writeFileSync(filePath, sqlContent, 'utf8');
    console.log(`✅ Backup de esquema guardado en: ${filePath}`);
    
  } finally {
    client.release();
  }
}

// Ejecutar backup
createBackup().catch(console.error);