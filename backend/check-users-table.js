const { Pool } = require('pg');

async function checkUsersTable() {
    const pool = new Pool({
        user: process.env.PGUSER || 'admin',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'postgres',
        password: process.env.PGPASSWORD || 'admin123',
        port: process.env.PGPORT || 5432,
    });

    try {
        console.log('Verificando estructura de la tabla users...\n');
        
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('Columnas de la tabla users:');
        result.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type}) - ${row.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
        });
        
        console.log('\nVerificando datos de ejemplo:');
        const sampleData = await pool.query('SELECT id, name, apellido, email, role FROM users LIMIT 3');
        console.log('Datos de muestra:');
        sampleData.rows.forEach(row => {
            console.log(`- ID: ${row.id}, Name: ${row.name}, Apellido: ${row.apellido}, Email: ${row.email}, Role: ${row.role}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkUsersTable();