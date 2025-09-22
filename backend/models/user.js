const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async updateUser(id, { name, apellido, email, role, area, notification_enabled }) {
    // Solo actualiza los campos enviados
    let fields = [];
    let params = [];
  if (name !== undefined) { fields.push('name = $' + (params.length+1)); params.push(name); }
  if (apellido !== undefined) { fields.push('apellido = $' + (params.length+1)); params.push(apellido); }
    if (email !== undefined) { fields.push('email = $' + (params.length+1)); params.push(email); }
    if (role !== undefined) { fields.push('role = $' + (params.length+1)); params.push(role); }
    if (area !== undefined) { fields.push('area = $' + (params.length+1)); params.push(area); }
    if (notification_enabled !== undefined) { fields.push('notification_enabled = $' + (params.length+1)); params.push(notification_enabled); }
    if (!fields.length) return null;
    params.push(id);
    const res = await pool.query(
  `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, name, apellido, email, role, area, notification_enabled`,
      params
    );
    return res.rows[0];
  },
  async deleteUser(id) {
    const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return res.rows[0];
  },
  async resetPassword(id, password) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [password_hash, id]
    );
    return res.rows[0];
  },
  async getAll({ page = 1, limit = 20, search = '', area = '', role = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    if (search) {
      params.push(`%${search}%`);
      where.push(`LOWER(name) LIKE LOWER($${params.length})`);
    }
    if (area) {
      params.push(area);
      where.push(`area = $${params.length}`);
    }
    if (role) {
      params.push(role);
      where.push(`role = $${params.length}`);
    }
    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    const data = await pool.query(
  `SELECT id, name, apellido, email, role, area, created_at FROM users ${whereClause} ORDER BY id DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    // Agregar campo activo (true por defecto)
    data.rows.forEach(u => u.active = true);
    // Total
    let totalParams = params.slice(0, params.length-2);
    const total = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      totalParams
    );
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },

  async getAreas() {
  const res = await pool.query("SELECT DISTINCT area FROM users WHERE area IS NOT NULL AND area <> ''");
  return res.rows.map(r => r.area);
  },
  async create({ name, apellido, email, password, role, area, notification_enabled = true }) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'INSERT INTO users (name, apellido, email, password_hash, role, area, notification_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, apellido, email, role, area, notification_enabled',
      [name, apellido, email, password_hash, role, area, notification_enabled]
    );
    return res.rows[0];
  },
  async setNotificationEnabled(userId, enabled) {
    const res = await pool.query(
      'UPDATE users SET notification_enabled = $1 WHERE id = $2 RETURNING id, name, apellido, email, role, notification_enabled',
      [enabled, userId]
    );
    return res.rows[0];
  },
  async getById(id) {
    const res = await pool.query('SELECT id, name, apellido, email, role, notification_enabled FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  async getStats() {
    try {
      console.log('📊 User.getStats - Obteniendo estadísticas de usuarios...');
      
      // Obtener estadísticas por rol
      const roleStats = await pool.query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM users 
        GROUP BY role
      `);
      
      // Obtener estadísticas por área
      const areaStats = await pool.query(`
        SELECT 
          area,
          COUNT(*) as count
        FROM users 
        WHERE area IS NOT NULL AND area <> ''
        GROUP BY area
      `);
      
      // Obtener total de usuarios
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
      const total = parseInt(totalResult.rows[0].total);
      
      // Obtener usuarios activos (asumiendo que todos están activos por defecto)
      const activeResult = await pool.query('SELECT COUNT(*) as active FROM users');
      const active = parseInt(activeResult.rows[0].active);
      
      // Procesar estadísticas por rol
      const stats = {
        total: total,
        active: active,
        admins: 0,
        vendedores: 0,
        laboratorio: 0,
        soporte: 0,
        gerencia: 0,
        byRole: {},
        byArea: {}
      };
      
      // Mapear roles a categorías
      roleStats.rows.forEach(row => {
        const role = row.role;
        const count = parseInt(row.count);
        stats.byRole[role] = count;
        
        if (role === 'admin') {
          stats.admins = count;
        } else if (['vendedor_comercial', 'jefa_comercial'].includes(role)) {
          stats.vendedores += count;
        } else if (['jefe_laboratorio', 'usuario_laboratorio', 'laboratorio'].includes(role)) {
          stats.laboratorio += count;
        } else if (role === 'soporte') {
          stats.soporte = count;
        } else if (role === 'gerencia') {
          stats.gerencia = count;
        }
      });
      
      // Procesar estadísticas por área
      areaStats.rows.forEach(row => {
        stats.byArea[row.area] = parseInt(row.count);
      });
      
      console.log('✅ User.getStats - Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ User.getStats - Error:', error);
      throw error;
    }
  },
};

module.exports = User;
