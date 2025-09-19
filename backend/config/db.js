// PostgreSQL connection config (example)
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'admin',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'admin123',
  port: process.env.PGPORT || 5432,
});

module.exports = pool;
