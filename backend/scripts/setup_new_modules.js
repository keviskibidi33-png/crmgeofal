const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function setupNewModules() {
  try {
    console.log('🚀 Configurando nuevos módulos...');
    
    // Leer y ejecutar script SQL
    const sqlPath = path.join(__dirname, '../sql/create_new_tables_safe.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Creando tablas de base de datos...');
    await db.query(sqlContent);
    
    console.log('✅ Tablas creadas exitosamente');
    
    // Crear directorios de uploads si no existen
    const uploadDirs = [
      'uploads/shipments',
      'uploads/project-evidence',
      'uploads/invoices'
    ];
    
    for (const dir of uploadDirs) {
      const fullPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Directorio creado: ${dir}`);
      }
    }
    
    console.log('✅ Directorios de uploads creados');
    
    // Verificar que las tablas se crearon correctamente
    const tables = [
      'templates',
      'shipments',
      'shipment_status',
      'project_evidence',
      'project_invoices'
    ];
    
    for (const table of tables) {
      const result = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ Tabla ${table} existe`);
      } else {
        console.log(`❌ Tabla ${table} no existe`);
      }
    }
    
    console.log('🎉 Configuración de nuevos módulos completada');
    
  } catch (error) {
    console.error('❌ Error configurando nuevos módulos:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupNewModules()
    .then(() => {
      console.log('✅ Setup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en setup:', error);
      process.exit(1);
    });
}

module.exports = setupNewModules;
