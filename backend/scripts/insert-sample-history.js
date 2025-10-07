const pool = require('../config/db');

async function insertSampleHistory() {
  try {
    console.log('🔄 Insertando datos de ejemplo en project_history...');

    // Obtener proyectos y usuarios existentes
    const projectsResult = await pool.query('SELECT id, name FROM projects LIMIT 5');
    const usersResult = await pool.query('SELECT id, name FROM users LIMIT 3');
    
    if (projectsResult.rows.length === 0) {
      console.log('❌ No hay proyectos en la base de datos');
      return;
    }
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    const projects = projectsResult.rows;
    const users = usersResult.rows;
    
    console.log(`📋 Encontrados ${projects.length} proyectos y ${users.length} usuarios`);

    // Limpiar datos existentes
    await pool.query('DELETE FROM project_history');
    console.log('🧹 Datos existentes eliminados');

    // Insertar datos de ejemplo
    const sampleActions = [
      'created', 'updated', 'status_changed', 'assigned', 'completed', 'cancelled'
    ];
    
    const sampleNotes = [
      'Proyecto creado inicialmente',
      'Información del proyecto actualizada',
      'Estado cambiado a "En progreso"',
      'Proyecto asignado al equipo',
      'Proyecto completado exitosamente',
      'Proyecto cancelado por cambios en requerimientos'
    ];

    let insertedCount = 0;
    
    for (const project of projects) {
      // Crear entre 3-8 entradas por proyecto
      const entriesCount = Math.floor(Math.random() * 6) + 3;
      
      for (let i = 0; i < entriesCount; i++) {
        const action = sampleActions[Math.floor(Math.random() * sampleActions.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const note = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
        
        // Crear fecha aleatoria en los últimos 30 días
        const daysAgo = Math.floor(Math.random() * 30);
        const performedAt = new Date();
        performedAt.setDate(performedAt.getDate() - daysAgo);
        
        await pool.query(`
          INSERT INTO project_history (project_id, action, performed_by, notes, performed_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [project.id, action, user.id, note, performedAt]);
        
        insertedCount++;
      }
    }
    
    console.log(`✅ ${insertedCount} entradas de historial insertadas`);
    
    // Verificar datos insertados
    const countResult = await pool.query('SELECT COUNT(*) FROM project_history');
    console.log(`📊 Total de registros en project_history: ${countResult.rows[0].count}`);
    
    // Mostrar algunos ejemplos
    const examples = await pool.query(`
      SELECT ph.*, p.name as project_name, u.name as user_name
      FROM project_history ph
      LEFT JOIN projects p ON ph.project_id = p.id
      LEFT JOIN users u ON ph.performed_by = u.id
      ORDER BY ph.performed_at DESC
      LIMIT 5
    `);
    
    console.log('📋 Ejemplos de datos insertados:');
    examples.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Proyecto: ${row.project_name} | Acción: ${row.action} | Usuario: ${row.user_name} | Fecha: ${row.performed_at}`);
    });

  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
  }
}

if (require.main === module) {
  insertSampleHistory().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  });
}

module.exports = insertSampleHistory;
