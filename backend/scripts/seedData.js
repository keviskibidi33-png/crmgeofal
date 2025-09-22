const pool = require('../config/db');

// Script para poblar la base de datos con datos de ejemplo
async function seedData() {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Verificar si las tablas existen
    const tables = ['users', 'projects', 'quotes', 'tickets', 'companies'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Tabla ${table} existe con ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`❌ Tabla ${table} no existe:`, error.message);
      }
    }

    // Insertar datos de ejemplo si las tablas están vacías
    await seedUsers();
    await seedCompanies();
    await seedProjects();
    await seedQuotes();
    await seedTickets();

    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await pool.end();
  }
}

async function seedUsers() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('👥 Insertando usuarios de ejemplo...');
      
      const users = [
        {
          name: 'Admin Sistema',
          email: 'admin@geofal.com',
          role: 'admin',
          password: '$2b$10$example', // Hash de ejemplo
          created_at: new Date()
        },
        {
          name: 'María González',
          email: 'maria@geofal.com',
          role: 'jefa_comercial',
          password: '$2b$10$example',
          created_at: new Date()
        },
        {
          name: 'Carlos López',
          email: 'carlos@geofal.com',
          role: 'vendedor_comercial',
          password: '$2b$10$example',
          created_at: new Date()
        },
        {
          name: 'Ana Martínez',
          email: 'ana@geofal.com',
          role: 'jefe_laboratorio',
          password: '$2b$10$example',
          created_at: new Date()
        },
        {
          name: 'Luis Rodríguez',
          email: 'luis@geofal.com',
          role: 'usuario_laboratorio',
          password: '$2b$10$example',
          created_at: new Date()
        }
      ];

      for (const user of users) {
        await pool.query(
          'INSERT INTO users (name, email, role, password, created_at) VALUES ($1, $2, $3, $4, $5)',
          [user.name, user.email, user.role, user.password, user.created_at]
        );
      }
      
      console.log(`✅ ${users.length} usuarios insertados`);
    }
  } catch (error) {
    console.log('⚠️ Error insertando usuarios:', error.message);
  }
}

async function seedCompanies() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM companies');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('🏢 Insertando empresas de ejemplo...');
      
      const companies = [
        {
          name: 'Constructora ABC',
          ruc: '20123456789',
          email: 'contacto@constructoraabc.com',
          phone: '+51 987 654 321',
          address: 'Av. Principal 123, Lima',
          created_at: new Date()
        },
        {
          name: 'Inmobiliaria XYZ',
          ruc: '20987654321',
          email: 'info@inmobiliariaxyz.com',
          phone: '+51 987 123 456',
          address: 'Jr. Comercial 456, Lima',
          created_at: new Date()
        },
        {
          name: 'Desarrolladora DEF',
          ruc: '20555666777',
          email: 'ventas@desarrolladoradef.com',
          phone: '+51 987 789 012',
          address: 'Av. Industrial 789, Lima',
          created_at: new Date()
        }
      ];

      for (const company of companies) {
        await pool.query(
          'INSERT INTO companies (name, ruc, email, phone, address, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [company.name, company.ruc, company.email, company.phone, company.address, company.created_at]
        );
      }
      
      console.log(`✅ ${companies.length} empresas insertadas`);
    }
  } catch (error) {
    console.log('⚠️ Error insertando empresas:', error.message);
  }
}

async function seedProjects() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM projects');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('🏗️ Insertando proyectos de ejemplo...');
      
      const projects = [
        {
          name: 'Proyecto Residencial Los Pinos',
          location: 'Lima, Perú',
          company_id: 1,
          vendedor_id: 4,
          laboratorio_id: 4,
          created_at: new Date()
        },
        {
          name: 'Complejo Comercial Plaza Central',
          location: 'Arequipa, Perú',
          company_id: 2,
          vendedor_id: 4,
          laboratorio_id: 4,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Torre Corporativa Empresarial',
          location: 'Trujillo, Perú',
          company_id: 3,
          vendedor_id: 4,
          laboratorio_id: 4,
          created_at: new Date()
        }
      ];

      for (const project of projects) {
        await pool.query(
          'INSERT INTO projects (name, location, company_id, vendedor_id, laboratorio_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [project.name, project.location, project.company_id, project.vendedor_id, project.laboratorio_id, project.created_at]
        );
      }
      
      console.log(`✅ ${projects.length} proyectos insertados`);
    }
  } catch (error) {
    console.log('⚠️ Error insertando proyectos:', error.message);
  }
}

async function seedQuotes() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM quotes');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('📋 Insertando cotizaciones de ejemplo...');
      
      const quotes = [
        {
          project_id: 3,
          engineer_name: 'Ing. Carlos López',
          notes: 'Cotización para proyecto residencial',
          document_url: '/uploads/cotizacion-001.pdf',
          created_at: new Date()
        },
        {
          project_id: 4,
          engineer_name: 'Ing. Ana Martínez',
          notes: 'Cotización para complejo comercial',
          document_url: '/uploads/cotizacion-002.pdf',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          project_id: 5,
          engineer_name: 'Ing. Luis Rodríguez',
          notes: 'Cotización para torre corporativa',
          document_url: '/uploads/cotizacion-003.pdf',
          created_at: new Date()
        }
      ];

      for (const quote of quotes) {
        await pool.query(
          'INSERT INTO quotes (project_id, engineer_name, notes, document_url, created_at) VALUES ($1, $2, $3, $4, $5)',
          [quote.project_id, quote.engineer_name, quote.notes, quote.document_url, quote.created_at]
        );
      }
      
      console.log(`✅ ${quotes.length} cotizaciones insertadas`);
    }
  } catch (error) {
    console.log('⚠️ Error insertando cotizaciones:', error.message);
  }
}

async function seedTickets() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM tickets');
    if (parseInt(result.rows[0].count) === 0) {
      console.log('🎫 Insertando tickets de ejemplo...');
      
      const tickets = [
        {
          user_id: 4,
          title: 'Problema con sistema de cotizaciones',
          description: 'No se pueden generar PDFs de cotizaciones',
          status: 'abierto',
          priority: 'alta',
          created_at: new Date()
        },
        {
          user_id: 4,
          title: 'Solicitud de capacitación',
          description: 'Necesito capacitación en el módulo de proyectos',
          status: 'resuelto',
          priority: 'media',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          user_id: 4,
          title: 'Error en reportes',
          description: 'Los reportes no muestran datos correctos',
          status: 'abierto',
          priority: 'alta',
          created_at: new Date()
        }
      ];

      for (const ticket of tickets) {
        await pool.query(
          'INSERT INTO tickets (user_id, title, description, status, priority, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [ticket.user_id, ticket.title, ticket.description, ticket.status, ticket.priority, ticket.created_at]
        );
      }
      
      console.log(`✅ ${tickets.length} tickets insertados`);
    }
  } catch (error) {
    console.log('⚠️ Error insertando tickets:', error.message);
  }
}

// Ejecutar el seed
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
