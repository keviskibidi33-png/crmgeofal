const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  let pool;
  try {
    // Configuración de PostgreSQL
    pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '', // Cambiar por la contraseña real
      database: 'crmgeofal'
    });

    console.log('🔄 Iniciando backup de la base de datos PostgreSQL...');

    // Obtener todas las tablas
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log(`📊 Encontradas ${tablesResult.rows.length} tablas`);

    let backupContent = '';
    backupContent += '-- Backup completo de la base de datos CRM GEOFAL (PostgreSQL)\n';
    backupContent += `-- Fecha: ${new Date().toISOString()}\n`;
    backupContent += '-- Generado automáticamente\n\n';
    backupContent += 'BEGIN;\n\n';

    // Backup de cada tabla
    for (const table of tablesResult.rows) {
      const tableName = table.tablename;
      console.log(`📋 Procesando tabla: ${tableName}`);

      // Estructura de la tabla
      const createTableResult = await pool.query(`
        SELECT 
          'CREATE TABLE ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || ' (' ||
          string_agg(
            quote_ident(attname) || ' ' || 
            CASE 
              WHEN atttypid = 'int4'::regtype THEN 'INTEGER'
              WHEN atttypid = 'int8'::regtype THEN 'BIGINT'
              WHEN atttypid = 'varchar'::regtype THEN 'VARCHAR(' || atttypmod-4 || ')'
              WHEN atttypid = 'text'::regtype THEN 'TEXT'
              WHEN atttypid = 'bool'::regtype THEN 'BOOLEAN'
              WHEN atttypid = 'timestamp'::regtype THEN 'TIMESTAMP'
              WHEN atttypid = 'date'::regtype THEN 'DATE'
              WHEN atttypid = 'numeric'::regtype THEN 'NUMERIC'
              ELSE format_type(atttypid, atttypmod)
            END ||
            CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN atthasdef THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid) ELSE '' END,
            ', '
          ) || ');' as create_statement
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
        WHERE c.relname = $1 AND n.nspname = 'public' AND a.attnum > 0 AND NOT a.attisdropped
        GROUP BY schemaname, tablename
      `, [tableName]);

      if (createTableResult.rows.length > 0) {
        backupContent += `-- Estructura de la tabla ${tableName}\n`;
        backupContent += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
        backupContent += `${createTableResult.rows[0].create_statement}\n\n`;
      }

      // Datos de la tabla
      const dataResult = await pool.query(`SELECT * FROM "${tableName}"`);
      if (dataResult.rows.length > 0) {
        backupContent += `-- Datos de la tabla ${tableName}\n`;
        
        // Obtener nombres de columnas
        const columnsResult = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);
        
        const columnNames = columnsResult.rows.map(col => `"${col.column_name}"`).join(', ');
        
        // Insertar datos
        for (const row of dataResult.rows) {
          const values = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return `'${value}'`;
          }).join(', ');
          
          backupContent += `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values});\n`;
        }
        backupContent += '\n';
      }
    }

    backupContent += 'COMMIT;\n';

    // Guardar backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join('..', 'backups', `backup_completo_${timestamp}.sql`);
    
    fs.writeFileSync(backupPath, backupContent, 'utf8');
    
    console.log(`✅ Backup completado: ${backupPath}`);
    console.log(`📊 Tamaño del archivo: ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`);

    await pool.end();
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    if (pool) await pool.end();
    process.exit(1);
  }
}

backupDatabase();
