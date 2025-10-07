const pool = require('../config/db');

async function updateTicketSystemSimple() {
  try {
    console.log('🔧 Actualizando sistema de tablas para tickets (versión simple)...');
    
    // 1. Actualizar tabla tickets existente
    console.log('📋 Actualizando tabla tickets...');
    const updateTicketsQuery = `
      -- Agregar columnas que faltan (sin referencias a tablas externas)
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS actual_time INTEGER,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;
      
      -- Agregar created_by si no existe
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
      
      -- Copiar datos de user_id a created_by si created_by es null
      UPDATE tickets 
      SET created_by = user_id 
      WHERE created_by IS NULL;
      
      -- Copiar additional_notes a notes si existe
      UPDATE tickets 
      SET notes = additional_notes 
      WHERE additional_notes IS NOT NULL AND notes IS NULL;
    `;
    
    await pool.query(updateTicketsQuery);
    console.log('✅ Tabla tickets actualizada exitosamente');
    
    // 2. Crear tabla de comentarios de tickets
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
      
      -- Índices para comentarios
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_is_read ON ticket_comments(is_read);
    `;
    
    await pool.query(commentsQuery);
    console.log('✅ Tabla ticket_comments creada exitosamente');
    
    // 3. Crear tabla de notificaciones de tickets
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
      
      -- Índices para notificaciones
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_ticket_id ON ticket_notifications(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_user_id ON ticket_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_is_read ON ticket_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_ticket_notifications_created_at ON ticket_notifications(created_at);
    `;
    
    await pool.query(notificationsQuery);
    console.log('✅ Tabla ticket_notifications creada exitosamente');
    
    // 4. Crear tabla de historial de tickets
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
      
      -- Índices para historial
      CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id ON ticket_history(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_user_id ON ticket_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_created_at ON ticket_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_history_action ON ticket_history(action);
    `;
    
    await pool.query(historyQuery);
    console.log('✅ Tabla ticket_history creada exitosamente');
    
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
    
    // 6. Insertar datos de ejemplo si no existen
    console.log('📊 Insertando datos de ejemplo...');
    const sampleDataQuery = `
      -- Insertar tickets de ejemplo si no existen
      INSERT INTO tickets (title, description, status, priority, category, module, type, created_by, created_at)
      SELECT 
        'Problema técnico',
        'Descripción del problema técnico',
        'abierto',
        'alta',
        'Soporte Técnico',
        'Sistema',
        'Bug',
        u.id,
        NOW()
      FROM users u 
      WHERE u.role = 'admin' 
      LIMIT 1
      AND NOT EXISTS (SELECT 1 FROM tickets WHERE title = 'Problema técnico');
      
      INSERT INTO tickets (title, description, status, priority, category, module, type, created_by, created_at)
      SELECT 
        'Solicitud de funcionalidad',
        'Nueva funcionalidad solicitada',
        'en_progreso',
        'media',
        'Desarrollo',
        'Frontend',
        'Feature',
        u.id,
        NOW()
      FROM users u 
      WHERE u.role = 'admin' 
      LIMIT 1
      AND NOT EXISTS (SELECT 1 FROM tickets WHERE title = 'Solicitud de funcionalidad');
    `;
    
    await pool.query(sampleDataQuery);
    console.log('✅ Datos de ejemplo insertados');
    
    // 7. Verificar estructura de todas las tablas
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
    
    // 8. Verificar datos existentes
    console.log('\n📊 Verificando datos existentes...');
    const ticketCount = await pool.query('SELECT COUNT(*) as count FROM tickets');
    const commentCount = await pool.query('SELECT COUNT(*) as count FROM ticket_comments');
    const notificationCount = await pool.query('SELECT COUNT(*) as count FROM ticket_notifications');
    const historyCount = await pool.query('SELECT COUNT(*) as count FROM ticket_history');
    
    console.log(`  - Tickets: ${ticketCount.rows[0].count}`);
    console.log(`  - Comentarios: ${commentCount.rows[0].count}`);
    console.log(`  - Notificaciones: ${notificationCount.rows[0].count}`);
    console.log(`  - Historial: ${historyCount.rows[0].count}`);
    
    console.log('\n🎉 SISTEMA DE TABLAS DE TICKETS ACTUALIZADO EXITOSAMENTE');
    console.log('✅ Tabla tickets actualizada con nuevas columnas');
    console.log('✅ Nuevas tablas creadas (comentarios, notificaciones, historial)');
    console.log('✅ Índices optimizados para rendimiento');
    console.log('✅ Triggers configurados');
    console.log('✅ Datos de ejemplo insertados');
    
  } catch (error) {
    console.error('❌ Error actualizando sistema de tablas:', error);
  } finally {
    process.exit(0);
  }
}

updateTicketSystemSimple();
