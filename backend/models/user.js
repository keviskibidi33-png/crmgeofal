const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async updateUser(id, { name, apellido, email, role, area, phone, notification_enabled, active, password }) {
    console.log('🔍 User.updateUser - Datos recibidos:', { id, name, apellido, email, role, area, phone, notification_enabled, active, password: !!password });
    
    // Solo actualiza los campos enviados
    let fields = [];
    let params = [];
    if (name !== undefined) { fields.push('name = $' + (params.length+1)); params.push(name); }
    if (apellido !== undefined) { fields.push('apellido = $' + (params.length+1)); params.push(apellido); }
    if (email !== undefined) { fields.push('email = $' + (params.length+1)); params.push(email); }
    if (role !== undefined) { fields.push('role = $' + (params.length+1)); params.push(role); }
    if (area !== undefined) { fields.push('area = $' + (params.length+1)); params.push(area); }
    if (phone !== undefined) { fields.push('phone = $' + (params.length+1)); params.push(phone); }
    if (notification_enabled !== undefined) { fields.push('notification_enabled = $' + (params.length+1)); params.push(notification_enabled); }
    if (active !== undefined) { 
      console.log('🔍 User.updateUser - Actualizando campo active:', active);
      fields.push('active = $' + (params.length+1)); 
      params.push(active); 
    }
    if (password !== undefined) { 
      const password_hash = await bcrypt.hash(password, 10);
      fields.push('password_hash = $' + (params.length+1)); 
      params.push(password_hash); 
    }
    
    console.log('🔍 User.updateUser - Campos a actualizar:', fields);
    console.log('🔍 User.updateUser - Parámetros:', params);
    
    if (!fields.length) {
      console.log('❌ User.updateUser - No hay campos para actualizar');
      return null;
    }
    
    params.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, name, apellido, email, role, area, phone, notification_enabled, active, created_at`;
    console.log('🔍 User.updateUser - Query:', query);
    console.log('🔍 User.updateUser - Parámetros finales:', params);
    
    const res = await pool.query(query, params);
    console.log('✅ User.updateUser - Resultado:', res.rows[0]);
    return res.rows[0];
  },
  async deleteUser(id) {
    const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return res.rows[0];
  },
  // resetPassword eliminado totalmente
  async getAll({ page = 1, limit = 20, search = '', area = '', role = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let paramIndex = 1;
    
    if (search) {
      const searchPattern = `%${search}%`;
      
      // Si la búsqueda contiene espacios, intentar buscar como nombre + apellido
      if (search.includes(' ')) {
        const words = search.trim().split(/\s+/);
        if (words.length >= 2) {
          const firstName = words[0];
          const lastName = words.slice(1).join(' ');
          
          // Buscar múltiples combinaciones
          params.push(
            `%${firstName}%`,  // nombre contiene primera palabra
            `%${lastName}%`,   // apellido contiene resto
            `%${lastName}%`,   // nombre contiene resto 
            `%${firstName}%`,  // apellido contiene primera palabra
            searchPattern,     // nombre completo contiene búsqueda
            searchPattern,     // apellido completo contiene búsqueda
            searchPattern      // email contiene búsqueda
          );
          
          where.push(`(
            (LOWER(name) LIKE LOWER($${paramIndex}) AND LOWER(apellido) LIKE LOWER($${paramIndex + 1})) OR
            (LOWER(name) LIKE LOWER($${paramIndex + 2}) AND LOWER(apellido) LIKE LOWER($${paramIndex + 3})) OR
            LOWER(name) LIKE LOWER($${paramIndex + 4}) OR 
            LOWER(apellido) LIKE LOWER($${paramIndex + 5}) OR 
            LOWER(email) LIKE LOWER($${paramIndex + 6}) OR
            LOWER(CONCAT(name, ' ', apellido)) LIKE LOWER($${paramIndex + 4})
          )`);
          paramIndex += 7;
        } else {
          // Búsqueda simple con una palabra
          params.push(searchPattern, searchPattern, searchPattern);
          where.push(`(LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(apellido) LIKE LOWER($${paramIndex + 1}) OR LOWER(email) LIKE LOWER($${paramIndex + 2}))`);
          paramIndex += 3;
        }
      } else {
        // Búsqueda simple sin espacios
        params.push(searchPattern, searchPattern, searchPattern);
        where.push(`(LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(apellido) LIKE LOWER($${paramIndex + 1}) OR LOWER(email) LIKE LOWER($${paramIndex + 2}))`);
        paramIndex += 3;
      }
    }
    
    if (area) {
      params.push(area);
      where.push(`area = $${paramIndex}`);
      paramIndex++;
    }
    
    if (role) {
      params.push(role);
      where.push(`role = $${paramIndex}`);
      paramIndex++;
    }
    
    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    
    // Agregar limit y offset
    params.push(limit, offset);
    const limitIndex = paramIndex;
    const offsetIndex = paramIndex + 1;
    
    console.log('🔍 User.getAll - Query params:', { search, area, role, page, limit });
    console.log('🔍 User.getAll - SQL params:', params);
    console.log('🔍 User.getAll - Where clause:', whereClause);
    
    const data = await pool.query(
      `SELECT id, name, apellido, email, role, area, active, created_at 
       FROM users ${whereClause} 
       ORDER BY id DESC 
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      params
    );
    
    // Total - usar solo los parámetros de búsqueda, sin limit/offset
    let totalParams = params.slice(0, params.length - 2);
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
  async create({ name, apellido, email, phone, password, role, area, notification_enabled = true }) {
    const password_hash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'INSERT INTO users (name, apellido, email, phone, password_hash, role, area, notification_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, apellido, email, phone, role, area, notification_enabled',
      [name, apellido, email, phone, password_hash, role, area, notification_enabled]
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
      
      // Obtener total de usuarios (todos)
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
      const total = parseInt(totalResult.rows[0].total);
      
      // Obtener usuarios activos (solo donde active = true)
      const activeResult = await pool.query('SELECT COUNT(*) as active FROM users WHERE active = TRUE');
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
