const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function backupCompleto() {
  try {
    console.log('🔄 Iniciando backup completo de la base de datos...\n');
    
    // Crear directorio de backup si no existe
    const backupDir = path.join(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Generar nombre del archivo con fecha y hora
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const timestamp = `${fecha}T${hora}`;
    const filename = `backup_completo_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    console.log(`📁 Archivo de backup: ${filename}`);
    console.log(`📂 Ubicación: ${filepath}\n`);
    
    const backupData = {
      metadata: {
        fecha_backup: now.toISOString(),
        fecha_backup_local: now.toLocaleString('es-PE', { timeZone: 'America/Lima' }),
        version: '1.0',
        descripcion: 'Backup completo de la base de datos CRM GEOFAL',
        total_tablas: 0,
        total_registros: 0
      },
      tablas: {}
    };
    
    // Lista de todas las tablas a respaldar
    const tablas = [
      'users',
      'companies', 
      'projects',
      'quotes',
      'quote_items',
      'tickets',
      'ticket_comments',
      'activities',
      'audit_logs',
      'services',
      'subservices',
      'notifications'
    ];
    
    let totalRegistros = 0;
    
    console.log('📊 Respaldo de tablas:');
    console.log('='.repeat(50));
    
    for (const tabla of tablas) {
      try {
        console.log(`\n🔍 Respaldo de tabla: ${tabla}`);
        
        // Obtener estructura de la tabla
        const estructuraQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `;
        
        const estructura = await pool.query(estructuraQuery, [tabla]);
        
        // Obtener datos de la tabla
        const datosQuery = `SELECT * FROM ${tabla} ORDER BY id`;
        const datos = await pool.query(datosQuery);
        
        backupData.tablas[tabla] = {
          estructura: estructura.rows,
          datos: datos.rows,
          total_registros: datos.rows.length
        };
        
        totalRegistros += datos.rows.length;
        
        console.log(`   ✅ ${datos.rows.length} registros respaldados`);
        
        // Mostrar algunos datos de ejemplo para verificación
        if (datos.rows.length > 0) {
          const primerRegistro = datos.rows[0];
          const camposEjemplo = Object.keys(primerRegistro).slice(0, 3);
          console.log(`   📋 Campos: ${camposEjemplo.join(', ')}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error en tabla ${tabla}: ${error.message}`);
        backupData.tablas[tabla] = {
          error: error.message,
          datos: [],
          total_registros: 0
        };
      }
    }
    
    // Actualizar metadatos
    backupData.metadata.total_tablas = tablas.length;
    backupData.metadata.total_registros = totalRegistros;
    
    // Escribir archivo de backup
    console.log('\n💾 Escribiendo archivo de backup...');
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf8');
    
    // Obtener tamaño del archivo
    const stats = fs.statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ Backup completado exitosamente!');
    console.log('='.repeat(50));
    console.log(`📁 Archivo: ${filename}`);
    console.log(`📂 Ubicación: ${filepath}`);
    console.log(`📊 Tamaño: ${fileSizeInMB} MB`);
    console.log(`📋 Tablas respaldadas: ${backupData.metadata.total_tablas}`);
    console.log(`📝 Total registros: ${backupData.metadata.total_registros}`);
    console.log(`🕐 Fecha: ${backupData.metadata.fecha_backup_local}`);
    
    // Mostrar resumen por tabla
    console.log('\n📊 Resumen por tabla:');
    console.log('-'.repeat(50));
    Object.entries(backupData.tablas).forEach(([tabla, info]) => {
      if (info.error) {
        console.log(`❌ ${tabla}: ERROR - ${info.error}`);
      } else {
        console.log(`✅ ${tabla}: ${info.total_registros} registros`);
      }
    });
    
    console.log('\n🎉 Backup completo finalizado!');
    
    return {
      success: true,
      filename,
      filepath,
      size: fileSizeInMB,
      totalRegistros,
      totalTablas: tablas.length
    };
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupCompleto().then((result) => {
    if (result.success) {
      console.log('\n🎉 Proceso de backup completado exitosamente');
      process.exit(0);
    } else {
      console.error('\n❌ Error en el proceso de backup:', result.error);
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { backupCompleto };
