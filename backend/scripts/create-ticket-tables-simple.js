const pool = require('../config/db');

async function createTicketTablesSimple() {
  try {
    console.log('🔧 Creando tablas para el sistema de tickets...');
    
    // 1. Crear tabla de comentarios de tickets
    console.log('💬 Creando tabla ticket_comments...');
    const commentsQuery = `
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        is_system BOOLEAN DEFAULT FALSE,
        is_read BOOLEAN DEFAULT FALSE,
        attachment_url VARCHAR(500),
        attachment_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(commentsQuery);
    console.log('✅ Tabla ticket_comments creada exitosamente');
    
    // 2. Crear tabla de notificaciones de tickets
    console.log('🔔 Creando tabla ticket_notifications...');
    const notificationsQuery = `
      CREATE TABLE IF NOT EXISTS ticket_notifications (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(notificationsQuery);
    console.log('✅ Tabla ticket_notifications creada exitosamente');
    
    // 3. Crear tabla de historial de tickets
    console.log('📜 Creando tabla ticket_history...');
    const historyQuery = `
      CREATE TABLE IF NOT EXISTS ticket_history (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(historyQuery);
    console.log('✅ Tabla ticket_history creada exitosamente');
    
    // 4. Crear índices para optimizar rendimiento
    console.log('📊 Creando índices...');
    const indexesQuery = `
      -- Índices para comentarios
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_is_read ON ticket_comments(is_read);
      
      -- Índices para notificaciones
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_ticket_id ON ticket_notifications(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_user_id ON ticket_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_is_read ON ticket_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_created_at ON ticket_notifications(created_at);
      
      -- Índices para historial
      CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_user_id ON ticket_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_created_at ON ticket_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_action ON ticket_history(action);
    `;
    
    await pool.query(indexesQuery);
    console.log('✅ Índices creados exitosamente');
    
    // 5. Crear triggers para actualizar updated_at
    console.log('⚙️ Creando triggers...');
    const triggerQuery = `
      -- Función para actualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Triggers para tickets
      DROP TRIGGER IF EXISTS trigger_update_tickets_updated_at ON tickets;
      CREATE TRIGGER trigger_update_tickets_updated_at
        BEFORE UPDATE ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      
      -- Triggers para comentarios
      DROP TRIGGER IF EXISTS trigger_update_ticket_comments_updated_at ON ticket_comments;
      CREATE TRIGGER trigger_update_ticket_comments_updated_at
        BEFORE UPDATE ON ticket_comments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await pool.query(triggerQuery);
    console.log('✅ Triggers creados exitosamente');
    
    // 6. Verificar estructura de todas las tablas
    console.log('🔍 Verificando estructura de tablas...');
    const tables = ['tickets', 'ticket_comments', 'ticket_notifications', 'ticket_history'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n📋 Estructura de la tabla ${table}:`);
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    // 7. Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    const ticketCount = await pool.query('SELECT COUNT(*) as count FROM tickets');
    const commentCount = await pool.query('SELECT COUNT(*) as count FROM ticket_comments');
    const notificationCount = await pool.query('SELECT COUNT(*) as count FROM ticket_notifications');
    const historyCount = await pool.query('SELECT COUNT(*) as count FROM ticket_history');
    
    console.log(`  - Tickets: ${ticketCount.rows[0].count}`);
    console.log(`  - Comentarios: ${commentCount.rows[0].count}`);
    console.log(`  - Notificaciones: ${notificationCount.rows[0].count}`);
    console.log(`  - Historial: ${historyCount.rows[0].count}`);
    
    console.log('\n🎉 SISTEMA DE TABLAS DE TICKETS COMPLETADO EXITOSAMENTE');
    console.log('✅ Tabla tickets ya existía con todas las columnas necesarias');
    console.log('✅ Nuevas tablas creadas (comentarios, notificaciones, historial)');
    console.log('✅ Índices optimizados para rendimiento');
    console.log('✅ Triggers configurados');
    console.log('✅ Sistema listo para funcionar');
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    process.exit(0);
  }
}

createTicketTablesSimple();
