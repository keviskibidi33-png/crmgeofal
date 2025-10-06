const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportAllData() {
  try {
    console.log('📊 Iniciando exportación de todos los datos...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = path.join(__dirname, '..', 'exports', `backup_${timestamp}`);
    
    // Crear directorio de exportación
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Lista de tablas a exportar
    const tables = [
      'users',
      'companies', 
      'quotations',
      'quotation_items',
      'projects',
      'services',
      'evidences',
      'audit_logs',
      'notifications',
      'system_config'
    ];
    
    const exportData = {};
    
    for (const table of tables) {
      try {
        console.log(`📋 Exportando tabla: ${table}`);
        
        // Verificar si la tabla existe
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        if (tableExists.rows[0].exists) {
          // Obtener estructura de la tabla
          const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = $1 
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `, [table]);
          
          // Obtener datos de la tabla
          const data = await pool.query(`SELECT * FROM ${table}`);
          
          // Obtener conteo
          const count = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
          
          exportData[table] = {
            structure: structure.rows,
            data: data.rows,
            count: parseInt(count.rows[0].total),
            exported_at: new Date().toISOString()
          };
          
          console.log(`✅ ${table}: ${data.rows.length} registros exportados`);
        } else {
          console.log(`⚠️  Tabla ${table} no existe, omitiendo...`);
          exportData[table] = {
            exists: false,
            message: 'Tabla no existe',
            exported_at: new Date().toISOString()
          };
        }
      } catch (error) {
        console.error(`❌ Error exportando tabla ${table}:`, error.message);
        exportData[table] = {
          error: error.message,
          exported_at: new Date().toISOString()
        };
      }
    }
    
    // Guardar datos en archivo JSON
    const jsonFile = path.join(exportDir, 'all_data.json');
    fs.writeFileSync(jsonFile, JSON.stringify(exportData, null, 2));
    
    // Crear script SQL de respaldo
    const sqlFile = path.join(exportDir, 'backup_data.sql');
    let sqlContent = `-- =====================================================\n`;
    sqlContent += `-- RESPALDO COMPLETO DE DATOS - CRMGeoFal\n`;
    sqlContent += `-- Fecha: ${new Date().toLocaleString()}\n`;
    sqlContent += `-- =====================================================\n\n`;
    
    for (const [tableName, tableData] of Object.entries(exportData)) {
      if (tableData.data && tableData.data.length > 0) {
        sqlContent += `-- =====================================================\n`;
        sqlContent += `-- DATOS DE LA TABLA: ${tableName.toUpperCase()}\n`;
        sqlContent += `-- Total de registros: ${tableData.data.length}\n`;
        sqlContent += `-- =====================================================\n\n`;
        
        // Crear INSERT statements
        for (const row of tableData.data) {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'object' && value !== null) return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            return value;
          }).join(', ');
          
          sqlContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        }
        sqlContent += `\n`;
      }
    }
    
    fs.writeFileSync(sqlFile, sqlContent);
    
    // Crear resumen
    const summaryFile = path.join(exportDir, 'summary.txt');
    let summary = `RESUMEN DE EXPORTACIÓN - CRMGeoFal\n`;
    summary += `=====================================\n`;
    summary += `Fecha: ${new Date().toLocaleString()}\n`;
    summary += `Directorio: ${exportDir}\n\n`;
    summary += `TABLAS EXPORTADAS:\n`;
    summary += `==================\n`;
    
    for (const [tableName, tableData] of Object.entries(exportData)) {
      if (tableData.count !== undefined) {
        summary += `${tableName}: ${tableData.count} registros\n`;
      } else if (tableData.error) {
        summary += `${tableName}: ERROR - ${tableData.error}\n`;
      } else {
        summary += `${tableName}: No existe\n`;
      }
    }
    
    summary += `\nARCHIVOS GENERADOS:\n`;
    summary += `==================\n`;
    summary += `- all_data.json: Datos completos en formato JSON\n`;
    summary += `- backup_data.sql: Script SQL para restaurar datos\n`;
    summary += `- summary.txt: Este archivo de resumen\n`;
    
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`\n✅ Exportación completada exitosamente!`);
    console.log(`📁 Directorio: ${exportDir}`);
    console.log(`📄 Archivos generados:`);
    console.log(`   - all_data.json (${(fs.statSync(jsonFile).size / 1024).toFixed(2)} KB)`);
    console.log(`   - backup_data.sql (${(fs.statSync(sqlFile).size / 1024).toFixed(2)} KB)`);
    console.log(`   - summary.txt`);
    
    return exportDir;
    
  } catch (error) {
    console.error('❌ Error durante la exportación:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  exportAllData()
    .then(dir => {
      console.log(`\n🎉 Exportación completada en: ${dir}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = exportAllData;
