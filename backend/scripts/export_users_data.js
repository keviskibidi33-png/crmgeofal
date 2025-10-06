const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function exportUsersData() {
  try {
    console.log('👥 Iniciando exportación de datos de usuarios...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = path.join(__dirname, '..', 'exports', `users_backup_${timestamp}`);
    
    // Crear directorio de exportación
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Exportar datos de usuarios
    console.log('📋 Exportando tabla users...');
    const usersData = await pool.query('SELECT * FROM users ORDER BY id');
    const usersCount = await pool.query('SELECT COUNT(*) as total FROM users');
    
    console.log(`✅ Usuarios exportados: ${usersData.rows.length}`);
    
    // Crear archivo JSON con datos de usuarios
    const usersJson = {
      exported_at: new Date().toISOString(),
      total_users: parseInt(usersCount.rows[0].total),
      users: usersData.rows
    };
    
    const jsonFile = path.join(exportDir, 'users_data.json');
    fs.writeFileSync(jsonFile, JSON.stringify(usersJson, null, 2));
    
    // Crear script SQL para restaurar usuarios
    const sqlFile = path.join(exportDir, 'users_backup.sql');
    let sqlContent = `-- =====================================================\n`;
    sqlContent += `-- RESPALDO DE USUARIOS - CRMGeoFal\n`;
    sqlContent += `-- Fecha: ${new Date().toLocaleString()}\n`;
    sqlContent += `-- Total de usuarios: ${usersData.rows.length}\n`;
    sqlContent += `-- =====================================================\n\n`;
    
    // Crear INSERT statements para cada usuario
    for (const user of usersData.rows) {
      const columns = Object.keys(user).join(', ');
      const values = Object.values(user).map(value => {
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'object' && value !== null) return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        return value;
      }).join(', ');
      
      sqlContent += `INSERT INTO users (${columns}) VALUES (${values}) ON CONFLICT (id) DO UPDATE SET\n`;
      
      // Crear UPDATE para conflicto
      const updateFields = Object.keys(user).filter(key => key !== 'id').map(key => {
        const value = user[key];
        if (value === null) return `${key} = NULL`;
        if (typeof value === 'string') return `${key} = '${value.replace(/'/g, "''")}'`;
        if (typeof value === 'object' && value !== null) return `${key} = '${JSON.stringify(value).replace(/'/g, "''")}'`;
        return `${key} = ${value}`;
      }).join(', ');
      
      sqlContent += `  ${updateFields};\n\n`;
    }
    
    fs.writeFileSync(sqlFile, sqlContent);
    
    // Crear resumen de usuarios
    const summaryFile = path.join(exportDir, 'users_summary.txt');
    let summary = `RESUMEN DE USUARIOS - CRMGeoFal\n`;
    summary += `================================\n`;
    summary += `Fecha: ${new Date().toLocaleString()}\n`;
    summary += `Total de usuarios: ${usersData.rows.length}\n\n`;
    
    // Estadísticas por rol
    const roleStats = {};
    usersData.rows.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });
    
    summary += `ESTADÍSTICAS POR ROL:\n`;
    summary += `====================\n`;
    Object.entries(roleStats).forEach(([role, count]) => {
      summary += `${role}: ${count} usuarios\n`;
    });
    
    // Estadísticas por área
    const areaStats = {};
    usersData.rows.forEach(user => {
      const area = user.area || 'Sin área';
      areaStats[area] = (areaStats[area] || 0) + 1;
    });
    
    summary += `\nESTADÍSTICAS POR ÁREA:\n`;
    summary += `=====================\n`;
    Object.entries(areaStats).forEach(([area, count]) => {
      summary += `${area}: ${count} usuarios\n`;
    });
    
    // Usuarios activos vs inactivos
    const activeUsers = usersData.rows.filter(user => user.active === true || user.active === 'true').length;
    const inactiveUsers = usersData.rows.length - activeUsers;
    
    summary += `\nESTADO DE USUARIOS:\n`;
    summary += `===================\n`;
    summary += `Activos: ${activeUsers}\n`;
    summary += `Inactivos: ${inactiveUsers}\n`;
    
    summary += `\nARCHIVOS GENERADOS:\n`;
    summary += `==================\n`;
    summary += `- users_data.json: Datos completos en formato JSON\n`;
    summary += `- users_backup.sql: Script SQL para restaurar usuarios\n`;
    summary += `- users_summary.txt: Este archivo de resumen\n`;
    
    fs.writeFileSync(summaryFile, summary);
    
    console.log(`\n✅ Exportación de usuarios completada!`);
    console.log(`📁 Directorio: ${exportDir}`);
    console.log(`📄 Archivos generados:`);
    console.log(`   - users_data.json (${(fs.statSync(jsonFile).size / 1024).toFixed(2)} KB)`);
    console.log(`   - users_backup.sql (${(fs.statSync(sqlFile).size / 1024).toFixed(2)} KB)`);
    console.log(`   - users_summary.txt`);
    
    return exportDir;
    
  } catch (error) {
    console.error('❌ Error durante la exportación de usuarios:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  exportUsersData()
    .then(dir => {
      console.log(`\n🎉 Exportación de usuarios completada en: ${dir}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = exportUsersData;
