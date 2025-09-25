const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function cleanupCategoriesDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Iniciando limpieza de categorías de la base de datos...');
    
    // 1. Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    const subcategoriesCount = await client.query('SELECT COUNT(*) FROM subcategories');
    const projectCategoriesCount = await client.query('SELECT COUNT(*) FROM project_categories');
    const projectsWithCategories = await client.query(`
      SELECT COUNT(*) FROM projects 
      WHERE category_id IS NOT NULL OR subcategory_id IS NOT NULL
    `);
    
    console.log(`📋 Categorías: ${categoriesCount.rows[0].count}`);
    console.log(`📋 Subcategorías: ${subcategoriesCount.rows[0].count}`);
    console.log(`📋 Categorías de proyectos: ${projectCategoriesCount.rows[0].count}`);
    console.log(`📋 Proyectos con categorías: ${projectsWithCategories.rows[0].count}`);
    
    // 2. Crear backup de datos importantes
    console.log('\n💾 Creando backup de datos...');
    
    const backupData = await client.query(`
      SELECT 
        p.id as project_id,
        p.name as project_name,
        p.category_id,
        p.subcategory_id,
        p.category_name,
        p.subcategory_name,
        c.name as category_name_from_table,
        s.name as subcategory_name_from_table
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE p.category_id IS NOT NULL OR p.subcategory_id IS NOT NULL
    `);
    
    console.log(`📦 Backup creado: ${backupData.rows.length} registros`);
    
    // 3. Eliminar campos de categorías de la tabla projects
    console.log('\n🗑️ Eliminando campos de categorías de la tabla projects...');
    
    await client.query(`
      ALTER TABLE projects 
      DROP COLUMN IF EXISTS category_id,
      DROP COLUMN IF EXISTS subcategory_id,
      DROP COLUMN IF EXISTS category_name,
      DROP COLUMN IF EXISTS subcategory_name
    `);
    
    console.log('✅ Campos de categorías eliminados de projects');
    
    // 4. Eliminar índices relacionados
    console.log('\n🗑️ Eliminando índices relacionados...');
    
    try {
      await client.query('DROP INDEX IF EXISTS idx_project_attachments_category');
      await client.query('DROP INDEX IF EXISTS idx_project_attachments_subcategory');
      console.log('✅ Índices relacionados eliminados');
    } catch (error) {
      console.log('⚠️ Algunos índices no existían:', error.message);
    }
    
    // 5. Eliminar tablas de categorías
    console.log('\n🗑️ Eliminando tablas de categorías...');
    
    await client.query('DROP TABLE IF EXISTS subcategories CASCADE');
    console.log('✅ Tabla subcategories eliminada');
    
    await client.query('DROP TABLE IF EXISTS categories CASCADE');
    console.log('✅ Tabla categories eliminada');
    
    await client.query('DROP TABLE IF EXISTS project_categories CASCADE');
    console.log('✅ Tabla project_categories eliminada');
    
    // 6. Verificar limpieza
    console.log('\n✅ Verificando limpieza...');
    
    const remainingCategories = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'subcategories', 'project_categories')
    `);
    
    if (remainingCategories.rows.length === 0) {
      console.log('🎉 ¡Limpieza completada exitosamente!');
      console.log('📋 Todas las tablas de categorías han sido eliminadas');
      console.log('📋 Todos los campos de categorías han sido removidos de projects');
    } else {
      console.log('⚠️ Algunas tablas aún existen:', remainingCategories.rows);
    }
    
    // 7. Crear archivo de backup
    const fs = require('fs');
    const backupFile = `backup_categories_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backupData.rows, null, 2));
    console.log(`💾 Backup guardado en: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await cleanupCategoriesDatabase();
    console.log('\n🎯 Limpieza de categorías completada exitosamente!');
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

module.exports = { cleanupCategoriesDatabase };
