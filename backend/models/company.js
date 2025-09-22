const pool = require('../config/db');

const Company = {
  async getAll({ page = 1, limit = 20, search = '', type = '', area = '', city = '', sector = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    
    // Búsqueda en múltiples campos
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where.push(`(LOWER(name) LIKE LOWER($${params.length-3}) OR LOWER(contact_name) LIKE LOWER($${params.length-2}) OR LOWER(email) LIKE LOWER($${params.length-1}) OR LOWER(phone) LIKE LOWER($${params.length}))`);
    }
    
    // Filtro por tipo
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
    }
    if (city) {
      params.push(city);
      where.push(`city = $${params.length}`);
    }
    if (sector) {
      params.push(sector);
      where.push(`sector = $${params.length}`);
    }
    
    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);
    
        const data = await pool.query(
          `SELECT id, type, ruc, dni, name, address, email, phone, contact_name, city, sector, created_at FROM companies ${whereClause} ORDER BY id DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
          params
        );
    
    // Total con filtros
    let totalParams = params.slice(0, params.length-2);
    const total = await pool.query(
      `SELECT COUNT(*) FROM companies ${whereClause}`,
      totalParams
    );
    
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id) {
    const res = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    return res.rows[0];
  },
  async getByRuc(ruc) {
    const res = await pool.query('SELECT * FROM companies WHERE ruc = $1', [ruc]);
    return res.rows[0];
  },
  async create({ type, ruc, dni, name, address, email, phone, contact_name }) {
    const res = await pool.query(
      `INSERT INTO companies (type, ruc, dni, name, address, email, phone, contact_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name]
    );
    return res.rows[0];
  },
  async update(id, { type, ruc, dni, name, address, email, phone, contact_name }) {
    const res = await pool.query(
      `UPDATE companies SET type = $1, ruc = $2, dni = $3, name = $4, address = $5, email = $6, phone = $7, contact_name = $8 WHERE id = $9 RETURNING *`,
      [type, ruc, dni, name, address, email, phone, contact_name, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    return true;
  },

  async getStats() {
    try {
      console.log('📊 Company.getStats - Obteniendo estadísticas de clientes...');
      
      // Obtener estadísticas por tipo
      const typeStats = await pool.query(`
        SELECT 
          type,
          COUNT(*) as count
        FROM companies 
        GROUP BY type
      `);
      
      // Obtener total de clientes
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM companies');
      const total = parseInt(totalResult.rows[0].total);
      
      // Obtener clientes con email
      const emailResult = await pool.query('SELECT COUNT(*) as with_email FROM companies WHERE email IS NOT NULL AND email <> \'\'');
      const withEmail = parseInt(emailResult.rows[0].with_email);
      
      // Obtener clientes con teléfono
      const phoneResult = await pool.query('SELECT COUNT(*) as with_phone FROM companies WHERE phone IS NOT NULL AND phone <> \'\'');
      const withPhone = parseInt(phoneResult.rows[0].with_phone);
      
      // Procesar estadísticas por tipo
      const stats = {
        total: total,
        empresas: 0,
        personas: 0,
        withEmail: withEmail,
        withPhone: withPhone,
        byType: {}
      };
      
      // Mapear tipos a categorías
      typeStats.rows.forEach(row => {
        const type = row.type;
        const count = parseInt(row.count);
        stats.byType[type] = count;
        
        if (type === 'empresa') {
          stats.empresas = count;
        } else if (type === 'persona') {
          stats.personas = count;
        }
      });
      
      console.log('✅ Company.getStats - Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Company.getStats - Error:', error);
      throw error;
    }
  },
};

module.exports = Company;
