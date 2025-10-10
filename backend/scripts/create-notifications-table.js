const pool = require('../config/db');

async function createNotificationsTable() {
  try {
    console.log('🔔 Creando tabla notifications...');
    
    const notificationsQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL, -- 'project_assignment', 'quote_approved', 'quote_rejected', etc.
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
        metadata JSONB, -- Datos adicionales como fecha de asignación, etc.
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Índices para optimizar consultas
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_quote_id ON notifications(quote_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
      
      -- Índice compuesto para notificaciones no leídas por usuario
      CREATE INDEX IF NOT EXISTS idx_notifications_unread_user ON notifications(recipient_id, read_at) WHERE read_at IS NULL;
    `;
    
    await pool.query(notificationsQuery);
    console.log('✅ Tabla notifications creada exitosamente');
    
    // Verificar que la tabla se creó correctamente
    const checkQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position;
    `;
    
    const result = await pool.query(checkQuery);
    console.log('📋 Estructura de la tabla notifications:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('🎉 Tabla notifications creada y verificada exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tabla notifications:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createNotificationsTable()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = createNotificationsTable;
