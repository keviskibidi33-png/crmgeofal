const db = require('../config/db');

async function createDashboardData() {
  try {
    console.log('🚀 Creando datos para el dashboard...');
    
    // Verificar si ya existen datos
    const usersCount = await db.query('SELECT COUNT(*) as count FROM users');
    const projectsCount = await db.query('SELECT COUNT(*) as count FROM projects');
    const quotesCount = await db.query('SELECT COUNT(*) as count FROM quotes');
    const ticketsCount = await db.query('SELECT COUNT(*) as count FROM tickets');
    const companiesCount = await db.query('SELECT COUNT(*) as count FROM companies');
    
    console.log('📊 Estado actual de la base de datos:');
    console.log(`- Usuarios: ${usersCount.rows[0].count}`);
    console.log(`- Proyectos: ${projectsCount.rows[0].count}`);
    console.log(`- Cotizaciones: ${quotesCount.rows[0].count}`);
    console.log(`- Tickets: ${ticketsCount.rows[0].count}`);
    console.log(`- Empresas: ${companiesCount.rows[0].count}`);
    
    // Si no hay datos, crear algunos datos de prueba
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log('📝 Creando datos de prueba...');
      
      // Crear empresas de prueba
      const companies = [
        { name: 'Empresa ABC S.A.C.', ruc: '20123456789', email: 'contacto@empresaabc.com', phone: '987654321', address: 'Av. Principal 123' },
        { name: 'Corporación XYZ S.A.C.', ruc: '20987654321', email: 'info@corporacionxyz.com', phone: '987654322', address: 'Av. Secundaria 456' },
        { name: 'Industrias DEF S.A.C.', ruc: '20555666777', email: 'ventas@industriasdef.com', phone: '987654323', address: 'Av. Industrial 789' }
      ];
      
      for (const company of companies) {
        await db.query(`
          INSERT INTO companies (name, ruc, email, phone, address, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [company.name, company.ruc, company.email, company.phone, company.address]);
      }
      
      console.log('✅ Empresas creadas');
      
      // Crear proyectos de prueba
      const projects = [
        { name: 'Proyecto de Análisis de Suelos', description: 'Análisis completo de suelos para construcción', location: 'Lima, Perú', company_id: 1 },
        { name: 'Estudio de Impacto Ambiental', description: 'EIA para proyecto minero', location: 'Cusco, Perú', company_id: 2 },
        { name: 'Monitoreo de Calidad del Aire', description: 'Monitoreo continuo de calidad del aire', location: 'Arequipa, Perú', company_id: 3 }
      ];
      
      for (const project of projects) {
        await db.query(`
          INSERT INTO projects (name, description, location, company_id, created_by, created_at)
          VALUES ($1, $2, $3, $4, 1, NOW())
        `, [project.name, project.description, project.location, project.company_id]);
      }
      
      console.log('✅ Proyectos creados');
      
      // Crear cotizaciones de prueba
      const quotes = [
        { quote_number: 'COT-2025-0001', client_contact: 'Juan Pérez', total_amount: 15000.00, status: 'aprobada', company_id: 1, project_id: 1 },
        { quote_number: 'COT-2025-0002', client_contact: 'María García', total_amount: 25000.00, status: 'borrador', company_id: 2, project_id: 2 },
        { quote_number: 'COT-2025-0003', client_contact: 'Carlos López', total_amount: 18000.00, status: 'aprobada', company_id: 3, project_id: 3 }
      ];
      
      for (const quote of quotes) {
        await db.query(`
          INSERT INTO quotes (quote_number, client_contact, total_amount, status, company_id, project_id, created_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, 1, NOW())
        `, [quote.quote_number, quote.client_contact, quote.total_amount, quote.status, quote.company_id, quote.project_id]);
      }
      
      console.log('✅ Cotizaciones creadas');
      
      // Crear tickets de prueba
      const tickets = [
        { title: 'Solicitud de información', description: 'Necesito información sobre servicios de laboratorio', priority: 'media', status: 'abierto' },
        { title: 'Problema con cotización', description: 'Error en el cálculo de la cotización', priority: 'alta', status: 'abierto' },
        { title: 'Consulta sobre proyecto', description: 'Pregunta sobre el avance del proyecto', priority: 'baja', status: 'cerrado' }
      ];
      
      for (const ticket of tickets) {
        await db.query(`
          INSERT INTO tickets (title, description, priority, status, created_by, created_at)
          VALUES ($1, $2, $3, $4, 1, NOW())
        `, [ticket.title, ticket.description, ticket.priority, ticket.status]);
      }
      
      console.log('✅ Tickets creados');
      
      // Crear evidencias de prueba
      const evidences = [
        { title: 'Análisis de Suelos - Muestra 001', description: 'Resultados del análisis de suelos', project_id: 1 },
        { title: 'EIA - Fase 1', description: 'Primera fase del estudio de impacto ambiental', project_id: 2 },
        { title: 'Monitoreo Aire - Semana 1', description: 'Datos de monitoreo de la primera semana', project_id: 3 }
      ];
      
      for (const evidence of evidences) {
        await db.query(`
          INSERT INTO evidences (title, description, project_id, uploaded_by, created_at)
          VALUES ($1, $2, $3, 1, NOW())
        `, [evidence.title, evidence.description, evidence.project_id]);
      }
      
      console.log('✅ Evidencias creadas');
      
    } else {
      console.log('ℹ️ Ya existen datos en la base de datos');
    }
    
    // Verificar datos finales
    const finalUsersCount = await db.query('SELECT COUNT(*) as count FROM users');
    const finalProjectsCount = await db.query('SELECT COUNT(*) as count FROM projects');
    const finalQuotesCount = await db.query('SELECT COUNT(*) as count FROM quotes');
    const finalTicketsCount = await db.query('SELECT COUNT(*) as count FROM tickets');
    const finalCompaniesCount = await db.query('SELECT COUNT(*) as count FROM companies');
    
    console.log('\n📊 Estado final de la base de datos:');
    console.log(`- Usuarios: ${finalUsersCount.rows[0].count}`);
    console.log(`- Proyectos: ${finalProjectsCount.rows[0].count}`);
    console.log(`- Cotizaciones: ${finalQuotesCount.rows[0].count}`);
    console.log(`- Tickets: ${finalTicketsCount.rows[0].count}`);
    console.log(`- Empresas: ${finalCompaniesCount.rows[0].count}`);
    
    console.log('\n🎉 Dashboard data setup completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando datos del dashboard:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDashboardData()
    .then(() => {
      console.log('✅ Setup completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en setup:', error);
      process.exit(1);
    });
}

module.exports = createDashboardData;
