const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function backupDatabaseNode() {
  try {
    console.log('💾 Iniciando backup de la base de datos usando Node.js...\n');
    
    // Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Directorio de backups creado');
    }
    
    // Generar nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFileName = `crmgeofal_backup_${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFileName);
    
    console.log(`📋 Archivo de backup: ${backupFileName}`);
    
    let backupContent = '';
    
    // Header del backup
    backupContent += `-- CRM GEOFAL Database Backup\n`;
    backupContent += `-- Generated: ${new Date().toISOString()}\n`;
    backupContent += `-- Database: crmgeofal\n\n`;
    
    // 1. Backup de la estructura de tablas
    console.log('📋 Obteniendo estructura de tablas...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    backupContent += `-- ==============================================\n`;
    backupContent += `-- TABLE STRUCTURES\n`;
    backupContent += `-- ==============================================\n\n`;
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`   📋 Procesando tabla: ${tableName}`);
      
      // Obtener estructura de la tabla
      const structureResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);
      
      backupContent += `-- Table: ${tableName}\n`;
      backupContent += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const columns = structureResult.rows.map(col => {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        
        return colDef;
      });
      
      backupContent += columns.join(',\n') + '\n);\n\n';
    }
    
    // 2. Backup de datos
    console.log('\n📊 Obteniendo datos de las tablas...');
    backupContent += `-- ==============================================\n`;
    backupContent += `-- TABLE DATA\n`;
    backupContent += `-- ==============================================\n\n`;
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`   📊 Procesando datos: ${tableName}`);
      
      const dataResult = await pool.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        backupContent += `-- Data for table: ${tableName}\n`;
        
        // Obtener nombres de columnas
        const columns = Object.keys(dataResult.rows[0]);
        backupContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
        
        const values = dataResult.rows.map(row => {
          const rowValues = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value;
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          });
          return `  (${rowValues.join(', ')})`;
        });
        
        backupContent += values.join(',\n') + ';\n\n';
      } else {
        backupContent += `-- No data for table: ${tableName}\n\n`;
      }
    }
    
    // 3. Backup de secuencias
    console.log('\n🔢 Obteniendo secuencias...');
    backupContent += `-- ==============================================\n`;
    backupContent += `-- SEQUENCES\n`;
    backupContent += `-- ==============================================\n\n`;
    
    const sequencesResult = await pool.query(`
      SELECT sequence_name, start_value 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    for (const seq of sequencesResult.rows) {
      backupContent += `-- Sequence: ${seq.sequence_name}\n`;
      backupContent += `SELECT setval('${seq.sequence_name}', ${seq.start_value}, true);\n\n`;
    }
    
    // 4. Backup de funciones personalizadas
    console.log('\n⚙️ Obteniendo funciones personalizadas...');
    backupContent += `-- ==============================================\n`;
    backupContent += `-- CUSTOM FUNCTIONS\n`;
    backupContent += `-- ==============================================\n\n`;
    
    const functionsResult = await pool.query(`
      SELECT routine_name, routine_definition
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
    `);
    
    for (const func of functionsResult.rows) {
      backupContent += `-- Function: ${func.routine_name}\n`;
      backupContent += `${func.routine_definition};\n\n`;
    }
    
    // Escribir el archivo de backup
    console.log('\n💾 Escribiendo archivo de backup...');
    fs.writeFileSync(backupPath, backupContent, 'utf8');
    
    // Verificar el archivo
    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ Backup completado exitosamente');
    console.log(`📁 Archivo: ${backupPath}`);
    console.log(`📊 Tamaño: ${fileSizeMB} MB`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`📋 Tablas: ${tablesResult.rows.length}`);
    console.log(`🔢 Secuencias: ${sequencesResult.rows.length}`);
    console.log(`⚙️ Funciones: ${functionsResult.rows.length}`);
    
    // Listar archivos de backup
    console.log('\n📋 Archivos de backup disponibles:');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('crmgeofal_backup_'))
      .sort()
      .reverse()
      .slice(0, 5); // Mostrar solo los últimos 5
    
    backupFiles.forEach(file => {
      const filePath = path.join(backupDir, file);
      const fileStats = fs.statSync(filePath);
      const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
      const fileDate = fileStats.mtime.toLocaleString();
      console.log(`   - ${file} (${fileSizeMB} MB) - ${fileDate}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupDatabaseNode().then(() => {
    console.log('\n🎉 Backup de base de datos completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { backupDatabaseNode };
