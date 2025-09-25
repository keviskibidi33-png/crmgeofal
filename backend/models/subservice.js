const pool = require('../config/db');

const Subservice = {
  // Búsqueda inteligente por código o descripción
  async search(query, serviceId = null) {
    const searchTerm = `%${query.toLowerCase()}%`;
    let whereClause = 'WHERE (LOWER(codigo) LIKE $1 OR LOWER(descripcion) LIKE $1) AND is_active = true';
    let params = [searchTerm];
    
    if (serviceId) {
      whereClause += ' AND service_id = $2';
      params.push(serviceId);
    }
    
    const result = await pool.query(`
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.service_id,
        sv.name as service_name,
        sv.area
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN LOWER(s.codigo) = LOWER($1) THEN 1
          WHEN LOWER(s.codigo) LIKE LOWER($1) || '%' THEN 2
          ELSE 3
        END,
        s.codigo
      LIMIT 20
    `, params);
    
    return result.rows;
  },

  // Obtener todos los subservicios con filtros
  async getAll({ serviceId, area, q, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const clauses = ['s.is_active = true'];
    const params = [];
    
    if (serviceId) {
      params.push(serviceId);
      clauses.push(`s.service_id = $${params.length}`);
    }
    
    if (area) {
      params.push(area);
      clauses.push(`sv.area = $${params.length}`);
    }
    
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`(LOWER(s.codigo) LIKE $${params.length} OR LOWER(s.descripcion) LIKE $${params.length})`);
    }
    
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    
    const data = await pool.query(`
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.service_id,
        s.is_active,
        s.created_at,
        s.updated_at,
        sv.name as service_name,
        sv.area
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      ${where}
      ORDER BY s.codigo
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);
    
    const total = await pool.query(`
      SELECT COUNT(*) as count
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      ${where}
    `, params);
    
    return {
      rows: data.rows,
      total: parseInt(total.rows[0].count)
    };
  },

  // Obtener por ID
  async getById(id) {
    const result = await pool.query(`
      SELECT 
        s.*,
        sv.name as service_name,
        sv.area
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      WHERE s.id = $1 AND s.is_active = true
    `, [id]);
    
    return result.rows[0];
  },

  // Crear subservicio
  async create({ codigo, descripcion, norma, precio, service_id }) {
    const result = await pool.query(`
      INSERT INTO subservices (codigo, descripcion, norma, precio, service_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [codigo, descripcion, norma, precio, service_id]);
    
    return result.rows[0];
  },

  // Actualizar subservicio
  async update(id, { codigo, descripcion, norma, precio, service_id }) {
    const result = await pool.query(`
      UPDATE subservices 
      SET codigo = $1, descripcion = $2, norma = $3, precio = $4, service_id = $5
      WHERE id = $6
      RETURNING *
    `, [codigo, descripcion, norma, precio, service_id, id]);
    
    return result.rows[0];
  },

  // Eliminar subservicio (soft delete)
  async remove(id) {
    const result = await pool.query(`
      UPDATE subservices 
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    return result.rows[0];
  },

  // Eliminar permanentemente
  async delete(id) {
    const result = await pool.query('DELETE FROM subservices WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  // Obtener por código exacto
  async getByCodigo(codigo) {
    const result = await pool.query(`
      SELECT 
        s.*,
        sv.name as service_name,
        sv.area
      FROM subservices s
      JOIN services sv ON s.service_id = sv.id
      WHERE s.codigo = $1 AND s.is_active = true
    `, [codigo]);
    
    return result.rows[0];
  }
};

module.exports = Subservice;