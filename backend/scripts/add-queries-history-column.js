const pool = require('../config/db');

async function addQueriesHistoryColumn() {
  try {
    console.log('🔧 Agregando columna queries_history a la tabla projects...');
    
    // Verificar si la columna ya existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'queries_history'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna queries_history ya existe en la tabla projects');
      return;
    }
    
    // Agregar la columna
    await pool.query(`
      ALTER TABLE projects 
      ADD COLUMN queries_history JSONB DEFAULT '[]'::jsonb
    `);
    
    console.log('✅ Columna queries_history agregada exitosamente a la tabla projects');
    
    // Crear índice para mejor rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_queries_history 
      ON projects USING GIN (queries_history)
    `);
    
    console.log('✅ Índice creado para queries_history');
    
  } catch (error) {
    console.error('❌ Error agregando columna queries_history:', error);
    throw error;
  }
}

if (require.main === module) {
  addQueriesHistoryColumn()
    .then(() => {
      console.log('Script de agregar columna queries_history ejecutado exitosamente.');
      pool.end();
    })
    .catch(console.error);
}

module.exports = addQueriesHistoryColumn;
