const { Pool } = require('pg');

async function checkUsersData() {
    const pool = new Pool({
        user: process.env.PGUSER || 'admin',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD || 'admin123',
        port: process.env.PGPORT || 5432,
    });

    try {
        console.log('🔍 Verificando usuarios reales en la base de datos...\n');
        
        // Buscar usuarios que contengan "admin" en nombre, apellido o email
        const adminUsers = await pool.query(`
            SELECT id, name, apellido, email, role 
            FROM users 
            WHERE LOWER(name) LIKE '%admin%' 
               OR LOWER(apellido) LIKE '%admin%' 
               OR LOWER(email) LIKE '%admin%'
            ORDER BY id
        `);
        
        console.log('Usuarios que contienen "admin":');
        adminUsers.rows.forEach(user => {
            console.log(`- ID: ${user.id}, Name: "${user.name}", Apellido: "${user.apellido}", Email: "${user.email}", Role: ${user.role}`);
        });
        
        console.log('\n🔍 Probando búsqueda exacta "admin sito":');
        const exactSearch = await pool.query(`
            SELECT id, name, apellido, email, role 
            FROM users 
            WHERE LOWER(name) LIKE LOWER('%admin sito%') 
               OR LOWER(apellido) LIKE LOWER('%admin sito%') 
               OR LOWER(email) LIKE LOWER('%admin sito%')
            ORDER BY id
        `);
        
        console.log('Resultados para "admin sito":');
        if (exactSearch.rows.length === 0) {
            console.log('❌ No se encontraron usuarios');
        } else {
            exactSearch.rows.forEach(user => {
                console.log(`- ID: ${user.id}, Name: "${user.name}", Apellido: "${user.apellido}", Email: "${user.email}"`);
            });
        }
        
        console.log('\n🔍 Probando búsqueda por palabras separadas:');
        const separateSearch = await pool.query(`
            SELECT id, name, apellido, email, role 
            FROM users 
            WHERE (LOWER(name) LIKE '%admin%' AND LOWER(apellido) LIKE '%sito%')
               OR (LOWER(name) LIKE '%sito%' AND LOWER(apellido) LIKE '%admin%')
               OR LOWER(CONCAT(name, ' ', apellido)) LIKE '%admin sito%'
               OR LOWER(CONCAT(name, ' ', apellido)) LIKE '%sito admin%'
            ORDER BY id
        `);
        
        console.log('Resultados para palabras separadas:');
        if (separateSearch.rows.length === 0) {
            console.log('❌ No se encontraron usuarios');
        } else {
            separateSearch.rows.forEach(user => {
                console.log(`- ID: ${user.id}, Name: "${user.name}", Apellido: "${user.apellido}", Email: "${user.email}"`);
            });
        }
        
        console.log('\n🔍 Primeros 10 usuarios para referencia:');
        const allUsers = await pool.query(`
            SELECT id, name, apellido, email, role 
            FROM users 
            ORDER BY id 
            LIMIT 10
        `);
        
        allUsers.rows.forEach(user => {
            console.log(`- ID: ${user.id}, Name: "${user.name}", Apellido: "${user.apellido}", Email: "${user.email}", Role: ${user.role}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkUsersData();