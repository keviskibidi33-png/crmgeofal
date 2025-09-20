// PostgreSQL connection config (example)
// In test environment we export a minimal stub so unit tests can run without a real DB.
if (process.env.NODE_ENV === 'test') {
  const stub = {
    query: async (sql, params) => {
      // Handle common patterns used in tests/controllers
      if (/SELECT NOW\(\)/i.test(sql)) return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
      if (/COUNT\(\s*\*\s*\)/i.test(sql)) return { rows: [{ count: '0' }], rowCount: 1 };
      // SELECT ... FROM table WHERE id = $1
      if (/SELECT .* FROM .* WHERE .*id = \$1/i.test(sql)) return { rows: [], rowCount: 0 };
      // INSERT ... RETURNING * or RETURNING id
      if (/RETURNING/i.test(sql) && /INSERT/i.test(sql)) {
        // create a dummy row with id=1 and echo some params
        const row = { id: 1 };
        if (params && params.length) {
          params.forEach((p, i) => { row[`p${i+1}`] = p; });
        }
        return { rows: [row], rowCount: 1 };
      }
      // UPDATE ... RETURNING
      if (/UPDATE/i.test(sql) && /RETURNING/i.test(sql)) return { rows: [{ id: params && params[params.length-1] ? params[params.length-1] : 1 }], rowCount: 1 };
      // Default
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
