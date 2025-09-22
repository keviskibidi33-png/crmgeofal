const pool = require('../config/db');

async function addCategories() {
  try {
    console.log('🔧 Agregando columnas de categorías a la tabla projects...');
    
    // Agregar columnas para categorías y subcategorías
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id INTEGER');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS subcategory_id INTEGER');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_name VARCHAR(255)');
    await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS subcategory_name VARCHAR(255)');
    
    console.log('✅ Columnas de categorías agregadas a la tabla projects');
    
    // Crear tabla de categorías si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Crear tabla de subcategorías si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_subcategories (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES project_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(category_id, name)
      )
    `);
    
    // Crear tabla para adjuntos de cotizaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_attachments (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES project_categories(id) ON DELETE SET NULL,
        subcategory_id INTEGER REFERENCES project_subcategories(id) ON DELETE SET NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER,
        file_type VARCHAR(100),
        description TEXT,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tablas de categorías y adjuntos creadas');
    
    // Insertar categorías de ejemplo
    const categories = [
      { name: 'Certificación de Materiales', description: 'Proyectos de certificación de materiales de construcción' },
      { name: 'Estudio de Impacto Ambiental', description: 'Estudios de impacto ambiental para proyectos' },
      { name: 'Consultoría Técnica', description: 'Servicios de consultoría técnica especializada' },
      { name: 'Capacitación', description: 'Programas de capacitación y formación' },
      { name: 'Auditoría', description: 'Servicios de auditoría y evaluación' }
    ];
    
    for (const cat of categories) {
      await pool.query(
        'INSERT INTO project_categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [cat.name, cat.description]
      );
    }
    
    console.log('✅ Categorías de ejemplo insertadas');
    
    // Insertar subcategorías de ejemplo
    const subcategories = [
      { category_name: 'Certificación de Materiales', name: 'Concreto', description: 'Certificación de concreto y agregados' },
      { category_name: 'Certificación de Materiales', name: 'Acero', description: 'Certificación de acero estructural' },
      { category_name: 'Certificación de Materiales', name: 'Maderas', description: 'Certificación de maderas y derivados' },
      { category_name: 'Estudio de Impacto Ambiental', name: 'EIA', description: 'Estudio de Impacto Ambiental completo' },
      { category_name: 'Estudio de Impacto Ambiental', name: 'PMA', description: 'Plan de Manejo Ambiental' },
      { category_name: 'Consultoría Técnica', name: 'Estructural', description: 'Consultoría en ingeniería estructural' },
      { category_name: 'Consultoría Técnica', name: 'Geotécnica', description: 'Consultoría en ingeniería geotécnica' }
    ];
    
    for (const sub of subcategories) {
      const catResult = await pool.query('SELECT id FROM project_categories WHERE name = $1', [sub.category_name]);
      if (catResult.rows.length > 0) {
        await pool.query(
          'INSERT INTO project_subcategories (category_id, name, description) VALUES ($1, $2, $3) ON CONFLICT (category_id, name) DO NOTHING',
          [catResult.rows[0].id, sub.name, sub.description]
        );
      }
    }
    
    console.log('✅ Subcategorías de ejemplo insertadas');
    
    // Actualizar proyectos existentes con categorías por defecto
    const defaultCategory = await pool.query('SELECT id, name FROM project_categories WHERE name = $1', ['Certificación de Materiales']);
    if (defaultCategory.rows.length > 0) {
      await pool.query(
        'UPDATE projects SET category_id = $1, category_name = $2 WHERE category_id IS NULL',
        [defaultCategory.rows[0].id, defaultCategory.rows[0].name]
      );
      console.log('✅ Proyectos existentes actualizados con categoría por defecto');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addCategories();
