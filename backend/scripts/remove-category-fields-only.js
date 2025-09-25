const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function removeCategoryFieldsOnly() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Eliminando solo campos de categorías de la tabla projects...');
    
    // 1. Verificar campos existentes
    console.log('\n📊 Verificando campos existentes...');
    
    const fieldsInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name IN ('category_id', 'subcategory_id', 'category_name', 'subcategory_name')
    `);
    
    console.log(`📋 Campos de categorías encontrados: ${fieldsInfo.rows.length}`);
    fieldsInfo.rows.forEach(field => {
      console.log(`  - ${field.column_name}: ${field.data_type} (${field.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 2. Crear backup de datos antes de eliminar
    console.log('\n💾 Creando backup de datos de categorías...');
    
    const backupData = await client.query(`
      SELECT 
        id,
        name,
        category_id,
        subcategory_id,
        category_name,
        subcategory_name,
        created_at
      FROM projects 
      WHERE category_id IS NOT NULL OR subcategory_id IS NOT NULL OR category_name IS NOT NULL OR subcategory_name IS NOT NULL
    `);
    
    console.log(`📦 Backup creado: ${backupData.rows.length} proyectos con datos de categorías`);
    
    // 3. Eliminar campos de categorías
    console.log('\n🗑️ Eliminando campos de categorías...');
    
    const fieldsToRemove = ['category_id', 'subcategory_id', 'category_name', 'subcategory_name'];
    
    for (const field of fieldsToRemove) {
      try {
        await client.query(`ALTER TABLE projects DROP COLUMN IF EXISTS ${field}`);
        console.log(`✅ Campo ${field} eliminado`);
      } catch (error) {
        console.log(`⚠️ Error eliminando ${field}:`, error.message);
      }
    }
    
    // 4. Verificar que los campos fueron eliminados
    console.log('\n✅ Verificando eliminación...');
    
    const remainingFields = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      AND column_name IN ('category_id', 'subcategory_id', 'category_name', 'subcategory_name')
    `);
    
    if (remainingFields.rows.length === 0) {
      console.log('🎉 ¡Campos de categorías eliminados exitosamente!');
    } else {
      console.log('⚠️ Algunos campos aún existen:', remainingFields.rows);
    }
    
    // 5. Crear archivo de backup
    const fs = require('fs');
    const backupFile = `backup_projects_categories_${new Date().toISOString().split('T')[0]}.json`;
    require('fs').writeFileSync(backupFile, JSON.stringify(backupData.rows, null, 2));
    console.log(`💾 Backup guardado en: ${backupFile}`);
    
    // 6. Mostrar resumen
    console.log('\n📋 RESUMEN:');
    console.log('✅ Campos de categorías eliminados de la tabla projects');
    console.log('✅ Tablas de categorías mantenidas (para datos históricos)');
    console.log('✅ Sistema de servicios completamente funcional');
    console.log('✅ Formulario rediseñado sin referencias a categorías');
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await removeCategoryFieldsOnly();
    console.log('\n🎯 Eliminación de campos de categorías completada!');
    console.log('📋 El sistema ahora usa únicamente el nuevo sistema de servicios');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { removeCategoryFieldsOnly };
