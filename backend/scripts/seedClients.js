const pool = require('../config/db');
require('dotenv').config({ path: '../.env' });

async function seedClients() {
  console.log('🚀 Iniciando la inserción de clientes de prueba...');
  try {
    const clients = [
      // Empresas
      {
        type: 'empresa',
        ruc: '20123456789',
        name: 'Constructora ABC S.A.C.',
        address: 'Av. Principal 123, Lima',
        email: 'contacto@constructoraabc.com',
        phone: '+51 1 234 5678',
        contact_name: 'María González'
      },
      {
        type: 'empresa',
        ruc: '20987654321',
        name: 'Ingeniería Geofal S.A.C.',
        address: 'Jr. Los Olivos 456, Arequipa',
        email: 'info@geofal.com',
        phone: '+51 54 987 654',
        contact_name: 'Carlos Mendoza'
      },
      {
        type: 'empresa',
        ruc: '20111222333',
        name: 'Minera del Sur S.A.',
        address: 'Av. Industrial 789, Cusco',
        email: 'ventas@minerasur.com',
        phone: '+51 84 111 222',
        contact_name: 'Ana Rodríguez'
      },
      {
        type: 'empresa',
        ruc: '20444555666',
        name: 'Laboratorio Ambiental Pro',
        address: 'Calle Laboratorio 321, Trujillo',
        email: 'servicios@labambiental.com',
        phone: '+51 44 555 666',
        contact_name: 'Luis Fernández'
      },
      {
        type: 'empresa',
        ruc: '20777888999',
        name: 'Consultora Técnica Integral',
        address: 'Av. Consultores 654, Piura',
        email: 'consultas@cti.com',
        phone: '+51 73 777 888',
        contact_name: 'Patricia Silva'
      },
      // Personas Naturales
      {
        type: 'persona',
        ruc: '', // RUC vacío para personas naturales
        dni: '12345678',
        name: 'Juan Pérez García',
        address: 'Jr. Libertad 123, Lima',
        email: 'juan.perez@email.com',
        phone: '+51 999 123 456',
        contact_name: 'Juan Pérez'
      },
      {
        type: 'persona',
        ruc: '', // RUC vacío para personas naturales
        dni: '87654321',
        name: 'María López Torres',
        address: 'Av. Sol 456, Arequipa',
        email: 'maria.lopez@email.com',
        phone: '+51 999 876 543',
        contact_name: 'María López'
      },
      {
        type: 'persona',
        ruc: '', // RUC vacío para personas naturales
        dni: '11223344',
        name: 'Carlos Ramírez Vargas',
        address: 'Calle Real 789, Cusco',
        email: 'carlos.ramirez@email.com',
        phone: '+51 999 112 233',
        contact_name: 'Carlos Ramírez'
      },
      {
        type: 'persona',
        ruc: '', // RUC vacío para personas naturales
        dni: '55667788',
        name: 'Ana Morales Jiménez',
        address: 'Jr. Independencia 321, Trujillo',
        email: 'ana.morales@email.com',
        phone: '+51 999 556 677',
        contact_name: 'Ana Morales'
      },
      {
        type: 'persona',
        ruc: '', // RUC vacío para personas naturales
        dni: '99887766',
        name: 'Roberto Castro Díaz',
        address: 'Av. Grau 654, Piura',
        email: 'roberto.castro@email.com',
        phone: '+51 999 998 877',
        contact_name: 'Roberto Castro'
      }
    ];

    for (const client of clients) {
      await pool.query(
        `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [client.type, client.ruc, client.dni, client.name, client.address, client.email, client.phone, client.contact_name]
      );
    }

    console.log(`✅ ${clients.length} clientes de prueba insertados exitosamente.`);
  } catch (error) {
    console.error('❌ Error durante la inserción de clientes de prueba:', error.message);
  } finally {
    pool.end();
  }
}

if (require.main === module) {
  seedClients();
}
