const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    const pool = new Pool({
        user: process.env.PGUSER || 'admin',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD || 'admin123',
        port: process.env.PGPORT || 5432,
    });

    try {
        console.log('🔧 Creando usuario de prueba para verificar búsqueda...\n');
        
        // Verificar si ya existe
        const existingUser = await pool.query(`
            SELECT id, name, apellido, email 
            FROM users 
            WHERE email = 'admin.sito@crm.com'
        `);
        
        if (existingUser.rows.length > 0) {
            console.log('✅ Usuario de prueba ya existe:');
            console.log(`- ID: ${existingUser.rows[0].id}, Name: "${existingUser.rows[0].name}", Apellido: "${existingUser.rows[0].apellido}"`);
        } else {
            // Crear usuario de prueba
            const password_hash = await bcrypt.hash('admin123', 10);
            const newUser = await pool.query(`
                INSERT INTO users (name, apellido, email, password_hash, role, area, notification_enabled, active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id, name, apellido, email, role, area
            `, ['Admin', 'Sito', 'admin.sito@crm.com', password_hash, 'admin', 'Sistemas', true, true]);
            
            console.log('✅ Usuario de prueba creado:');
            console.log(`- ID: ${newUser.rows[0].id}, Name: "${newUser.rows[0].name}", Apellido: "${newUser.rows[0].apellido}"`);
        }
        
        console.log('\n🔍 Probando búsqueda "admin sito":');
        const searchTest = await pool.query(`
            SELECT id, name, apellido, email, role 
            FROM users 
            WHERE (LOWER(name) LIKE LOWER('%admin%') AND LOWER(apellido) LIKE LOWER('%sito%'))
               OR (LOWER(name) LIKE LOWER('%sito%') AND LOWER(apellido) LIKE LOWER('%admin%'))
               OR LOWER(CONCAT(name, ' ', apellido)) LIKE LOWER('%admin sito%')
               OR LOWER(CONCAT(name, ' ', apellido)) LIKE LOWER('%sito admin%')
            ORDER BY id
        `);
        
        console.log('Resultados de búsqueda:');
        if (searchTest.rows.length === 0) {
            console.log('❌ No se encontraron usuarios');
        } else {
            searchTest.rows.forEach(user => {
                console.log(`- ID: ${user.id}, Name: "${user.name}", Apellido: "${user.apellido}", Email: "${user.email}"`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

createTestUser();