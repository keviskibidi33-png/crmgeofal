const pool = require('../config/db');

async function createTicketSystemTables() {
  try {
    console.log('🔧 Creando sistema completo de tablas para tickets...');
    
    // 1. Crear tabla de tickets si no existe
    console.log('📋 Creando tabla tickets...');
    const ticketsQuery = `
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'abierto',
        priority VARCHAR(20) DEFAULT 'media',
        category VARCHAR(100),
        module VARCHAR(100),
        type VARCHAR(50),
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER NOT NULL REFERENCES users(id),
        client_id INTEGER REFERENCES clients(id),
        project_id INTEGER REFERENCES projects(id),
        estimated_time INTEGER, -- en horas
        actual_time INTEGER, -- en horas
        tags TEXT[], -- array de tags
        notes TEXT,
        attachment_url VARCHAR(500),
        attachment_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        closed_at TIMESTAMP
      );
      
      -- Índices para tickets
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
      CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
      CREATE INDEX IF NOT EXISTS idx_tickets_module ON tickets(module);
    `;
    
    await pool.query(ticketsQuery);
    console.log('✅ Tabla tickets creada exitosamente');
    
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
        type VARCHAR(50) NOT NULL, -- 'comment', 'status_change', 'assignment', etc.
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
        action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', etc.
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
      -- Insertar categorías de ejemplo
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
      ON CONFLICT DO NOTHING;
      
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
      ON CONFLICT DO NOTHING;
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
    
    console.log('\n🎉 SISTEMA DE TABLAS DE TICKETS CREADO EXITOSAMENTE');
    console.log('✅ Todas las tablas están listas para funcionar');
    console.log('✅ Índices optimizados para rendimiento');
    console.log('✅ Triggers configurados');
    console.log('✅ Datos de ejemplo insertados');
    
  } catch (error) {
    console.error('❌ Error creando sistema de tablas:', error);
  } finally {
    process.exit(0);
  }
}

createTicketSystemTables();
