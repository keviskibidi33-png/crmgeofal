const pool = require('../config/db');

async function checkQuotesData() {
  try {
    console.log('🔍 Verificando datos de cotizaciones...');

    // Verificar si la tabla quotes existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quotes'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla quotes no existe');
      return;
    }

    console.log('✅ La tabla quotes existe');

    // Contar cotizaciones totales
    const totalCount = await pool.query('SELECT COUNT(*) FROM quotes');
    console.log(`📊 Total de cotizaciones: ${totalCount.rows[0].count}`);

    // Contar por estado
    const statusCounts = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM quotes 
      GROUP BY status 
      ORDER BY count DESC
    `);

    console.log('📋 Cotizaciones por estado:');
    statusCounts.rows.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });

    // Mostrar algunas cotizaciones de ejemplo
    const sampleQuotes = await pool.query(`
      SELECT id, client_contact, client_email, status, total, created_at
      FROM quotes 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (sampleQuotes.rows.length > 0) {
      console.log('📋 Ejemplos de cotizaciones:');
      sampleQuotes.rows.forEach(quote => {
        console.log(`  - ID: ${quote.id} | Cliente: ${quote.client_contact} | Estado: ${quote.status} | Total: S/ ${quote.total}`);
      });
    } else {
      console.log('⚠️  No hay cotizaciones en la base de datos');
      
      // Insertar datos de ejemplo
      console.log('📝 Insertando cotizaciones de ejemplo...');
      
      // Obtener un proyecto y usuario existente
      const projectResult = await pool.query('SELECT id FROM projects LIMIT 1');
      const userResult = await pool.query('SELECT id FROM users LIMIT 1');
      
      if (projectResult.rows.length > 0 && userResult.rows.length > 0) {
        const projectId = projectResult.rows[0].id;
        const userId = userResult.rows[0].id;
        
        const sampleQuotes = [
          {
            project_id: projectId,
            client_contact: 'Juan Pérez',
            client_email: 'juan.perez@empresa.com',
            client_phone: '+51 999 888 777',
            issue_date: new Date().toISOString().slice(0, 10),
            subtotal: 2000.00,
            igv: 360.00,
            total: 2360.00,
            status: 'borrador'
          },
          {
            project_id: projectId,
            client_contact: 'María García',
            client_email: 'maria.garcia@empresa.com',
            client_phone: '+51 999 777 666',
            issue_date: new Date().toISOString().slice(0, 10),
            subtotal: 1500.00,
            igv: 270.00,
            total: 1770.00,
            status: 'enviada'
          },
          {
            project_id: projectId,
            client_contact: 'Carlos López',
            client_email: 'carlos.lopez@empresa.com',
            client_phone: '+51 999 666 555',
            issue_date: new Date().toISOString().slice(0, 10),
            subtotal: 3000.00,
            igv: 540.00,
            total: 3540.00,
            status: 'aprobada'
          },
          {
            project_id: projectId,
            client_contact: 'Ana Martínez',
            client_email: 'ana.martinez@empresa.com',
            client_phone: '+51 999 555 444',
            issue_date: new Date().toISOString().slice(0, 10),
            subtotal: 1200.00,
            igv: 216.00,
            total: 1416.00,
            status: 'rechazada'
          },
          {
            project_id: projectId,
            client_contact: 'Luis Rodríguez',
            client_email: 'luis.rodriguez@empresa.com',
            client_phone: '+51 999 444 333',
            issue_date: new Date().toISOString().slice(0, 10),
            subtotal: 2500.00,
            igv: 450.00,
            total: 2950.00,
            status: 'borrador'
          }
        ];
        
        for (const quote of sampleQuotes) {
          await pool.query(`
            INSERT INTO quotes (
              project_id, client_contact, client_email, client_phone,
              issue_date, subtotal, igv, total, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          `, [
            quote.project_id,
            quote.client_contact,
            quote.client_email,
            quote.client_phone,
            quote.issue_date,
            quote.subtotal,
            quote.igv,
            quote.total,
            quote.status
          ]);
        }
        
        console.log('✅ 5 cotizaciones de ejemplo insertadas');
        
        // Verificar los datos insertados
        const newCount = await pool.query('SELECT COUNT(*) FROM quotes');
        console.log(`📊 Nuevo total de cotizaciones: ${newCount.rows[0].count}`);
      } else {
        console.log('❌ No se encontraron proyectos o usuarios para crear cotizaciones de ejemplo');
      }
    }

  } catch (error) {
    console.error('❌ Error verificando datos de cotizaciones:', error);
  }
}

if (require.main === module) {
  checkQuotesData().then(() => {
    console.log('🎉 Verificación completada');
    process.exit(0);
  });
}

module.exports = checkQuotesData;
