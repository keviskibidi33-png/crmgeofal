const db = require('../config/db');

async function addTestTickets() {
  try {
    console.log('🎫 Agregando tickets de prueba...');
    
    // Verificar si ya existen tickets
    const ticketsCount = await db.query('SELECT COUNT(*) as count FROM tickets');
    console.log(`📊 Tickets actuales: ${ticketsCount.rows[0].count}`);
    
    if (parseInt(ticketsCount.rows[0].count) === 0) {
      // Crear tickets de prueba
      const tickets = [
        {
          title: 'Solicitud de información sobre servicios',
          description: 'Necesito información detallada sobre los servicios de análisis de suelos que ofrecen.',
          priority: 'media',
          status: 'abierto',
          category: 'consulta'
        },
        {
          title: 'Problema con cotización',
          description: 'Hay un error en el cálculo de la cotización COT-2025-0001. El monto no coincide.',
          priority: 'alta',
          status: 'abierto',
          category: 'error'
        },
        {
          title: 'Consulta sobre proyecto',
          description: '¿Cuál es el avance del proyecto de análisis de suelos?',
          priority: 'baja',
          status: 'cerrado',
          category: 'seguimiento'
        },
        {
          title: 'Solicitud de modificación',
          description: 'Necesito modificar los parámetros del estudio de impacto ambiental.',
          priority: 'media',
          status: 'abierto',
          category: 'modificacion'
        },
        {
          title: 'Problema técnico',
          description: 'No puedo acceder al sistema de reportes.',
          priority: 'alta',
          status: 'abierto',
          category: 'tecnico'
        }
      ];
      
      for (const ticket of tickets) {
        await db.query(`
          INSERT INTO tickets (title, description, priority, status, user_id, created_at)
          VALUES ($1, $2, $3, $4, 6, NOW())
        `, [ticket.title, ticket.description, ticket.priority, ticket.status]);
      }
      
      console.log('✅ Tickets de prueba creados exitosamente');
    } else {
      console.log('ℹ️ Ya existen tickets en la base de datos');
    }
    
    // Verificar tickets finales
    const finalTicketsCount = await db.query('SELECT COUNT(*) as count FROM tickets');
    const openTicketsCount = await db.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'abierto'");
    
    console.log(`📊 Tickets totales: ${finalTicketsCount.rows[0].count}`);
    console.log(`📊 Tickets abiertos: ${openTicketsCount.rows[0].count}`);
    
    console.log('🎉 Tickets setup completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error agregando tickets de prueba:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addTestTickets()
    .then(() => {
      console.log('✅ Setup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en setup:', error);
      process.exit(1);
    });
}

module.exports = addTestTickets;
