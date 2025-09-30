const db = require('../config/db');

async function migrateRole() {
  try {
    console.log('🔄 Migrando usuarios con rol "laboratorio" a "usuario_laboratorio"...');
    const res = await db.query("UPDATE users SET role = 'usuario_laboratorio' WHERE role = 'laboratorio' RETURNING id, email, role");
    console.log(`✅ Migración completada. Usuarios actualizados: ${res.rowCount}`);
    if (res.rowCount > 0) {
      console.table(res.rows);
    }
  } catch (err) {
    console.error('❌ Error en migración de roles:', err.message);
    process.exitCode = 1;
  } finally {
    try { await db.end(); } catch {}
  }
}

migrateRole();


