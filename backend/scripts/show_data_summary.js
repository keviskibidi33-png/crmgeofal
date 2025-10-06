const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function showDataSummary() {
  try {
    console.log('📊 RESUMEN DE DATOS DEL SISTEMA CRMGeoFal');
    console.log('==========================================');
    console.log(`Fecha: ${new Date().toLocaleString()}\n`);
    
    // Lista de tablas a verificar
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
    
    let totalRecords = 0;
    
    for (const table of tables) {
      try {
        // Verificar si la tabla existe
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        if (tableExists.rows[0].exists) {
          // Obtener conteo
          const count = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
          const recordCount = parseInt(count.rows[0].total);
          totalRecords += recordCount;
          
          console.log(`📋 ${table.padEnd(20)}: ${recordCount.toString().padStart(6)} registros`);
          
          // Mostrar estadísticas específicas para ciertas tablas
          if (table === 'users') {
            const roleStats = await pool.query(`
              SELECT role, COUNT(*) as count 
              FROM users 
              GROUP BY role 
              ORDER BY COUNT(*) DESC
            `);
            console.log(`    └─ Roles: ${roleStats.rows.map(r => `${r.role}(${r.count})`).join(', ')}`);
          }
          
          if (table === 'companies') {
            const typeStats = await pool.query(`
              SELECT type, COUNT(*) as count 
              FROM companies 
              GROUP BY type 
              ORDER BY COUNT(*) DESC
            `);
            console.log(`    └─ Tipos: ${typeStats.rows.map(r => `${r.type}(${r.count})`).join(', ')}`);
          }
          
          if (table === 'projects') {
            const statusStats = await pool.query(`
              SELECT status, COUNT(*) as count 
              FROM projects 
              GROUP BY status 
              ORDER BY COUNT(*) DESC
            `);
            console.log(`    └─ Estados: ${statusStats.rows.map(r => `${r.status}(${r.count})`).join(', ')}`);
          }
          
          if (table === 'services') {
            const categoryStats = await pool.query(`
              SELECT category, COUNT(*) as count 
              FROM services 
              GROUP BY category 
              ORDER BY COUNT(*) DESC
            `);
            console.log(`    └─ Categorías: ${categoryStats.rows.map(r => `${r.category}(${r.count})`).join(', ')}`);
          }
          
        } else {
          console.log(`📋 ${table.padEnd(20)}: ${'NO EXISTE'.padStart(6)}`);
        }
      } catch (error) {
        console.log(`📋 ${table.padEnd(20)}: ${'ERROR'.padStart(6)} - ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 TOTAL DE REGISTROS: ${totalRecords.toLocaleString()}`);
    console.log('='.repeat(50));
    
    // Verificar respaldos disponibles
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (fs.existsSync(exportsDir)) {
      const backups = fs.readdirSync(exportsDir).filter(dir => 
        fs.statSync(path.join(exportsDir, dir)).isDirectory()
      );
      
      if (backups.length > 0) {
        console.log('\n📁 RESPALDOS DISPONIBLES:');
        console.log('========================');
        backups.forEach(backup => {
          const backupPath = path.join(exportsDir, backup);
          const stats = fs.statSync(backupPath);
          console.log(`📂 ${backup}`);
          console.log(`   Creado: ${stats.birthtime.toLocaleString()}`);
          
          // Verificar archivos en el respaldo
          const files = fs.readdirSync(backupPath);
          files.forEach(file => {
            const filePath = path.join(backupPath, file);
            const fileStats = fs.statSync(filePath);
            console.log(`   📄 ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
          });
          console.log('');
        });
      }
    }
    
    console.log('\n✅ Resumen completado');
    
  } catch (error) {
    console.error('❌ Error generando resumen:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  showDataSummary()
    .then(() => {
      console.log('\n🎉 Resumen generado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = showDataSummary;
