const pool = require('../config/db');

async function createProjectHistoryTable() {
  try {
    console.log('🔄 Verificando tabla project_history...');

    // Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_history'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ La tabla project_history ya existe');
      
      // Verificar estructura
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'project_history'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estructura actual de la tabla:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      return;
    }

    console.log('📝 Creando tabla project_history...');

    // Crear la tabla
    await pool.query(`
      CREATE TABLE project_history (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        performed_by INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Crear índices para optimizar consultas
    await pool.query(`
      CREATE INDEX idx_project_history_project_id ON project_history(project_id);
    `);
    
    await pool.query(`
      CREATE INDEX idx_project_history_created_at ON project_history(created_at);
    `);
    
    await pool.query(`
      CREATE INDEX idx_project_history_action ON project_history(action);
    `);

    console.log('✅ Tabla project_history creada exitosamente');
    console.log('✅ Índices creados para optimización');

    // Insertar algunos datos de ejemplo
    console.log('📝 Insertando datos de ejemplo...');
    
    // Obtener un proyecto y usuario existente
    const projectResult = await pool.query('SELECT id FROM projects LIMIT 1');
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    
    if (projectResult.rows.length > 0 && userResult.rows.length > 0) {
      const projectId = projectResult.rows[0].id;
      const userId = userResult.rows[0].id;
      
      const sampleEntries = [
        {
          project_id: projectId,
          action: 'created',
          performed_by: userId,
          notes: 'Proyecto creado inicialmente'
        },
        {
          project_id: projectId,
          action: 'updated',
          performed_by: userId,
          notes: 'Información del proyecto actualizada'
        },
        {
          project_id: projectId,
          action: 'status_changed',
          performed_by: userId,
          notes: 'Estado cambiado a "En progreso"'
        }
      ];
      
      for (const entry of sampleEntries) {
        await pool.query(`
          INSERT INTO project_history (project_id, action, performed_by, notes)
          VALUES ($1, $2, $3, $4)
        `, [entry.project_id, entry.action, entry.performed_by, entry.notes]);
      }
      
      console.log('✅ Datos de ejemplo insertados');
    } else {
      console.log('⚠️  No se encontraron proyectos o usuarios para crear datos de ejemplo');
    }

  } catch (error) {
    console.error('❌ Error creando tabla project_history:', error);
  }
}

if (require.main === module) {
  createProjectHistoryTable().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  });
}

module.exports = createProjectHistoryTable;
