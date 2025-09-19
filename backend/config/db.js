// PostgreSQL connection config (example)
// In test environment we export a minimal stub so unit tests can run without a real DB.
if (process.env.NODE_ENV === 'test') {
  const stub = {
    query: async (sql, params) => {
      // Basic responses for simple SELECT NOW() or other queries.
      if (/SELECT NOW\(\)/i.test(sql)) {
        return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    },
    connect: async () => ({ release: () => {} }),
  };
  module.exports = stub;
} else {
  const { Pool } = require('pg');

  const pool = new Pool({
    user: process.env.PGUSER || 'admin',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD || 'admin123',
    port: process.env.PGPORT || 5432,
  });

  module.exports = pool;
}
