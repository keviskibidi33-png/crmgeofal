const pool = require('../config/db');

const Project = {
  async getAllByUser(user, { page = 1, limit = 20, search = '', status = '', company_id = '', project_type = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let paramIndex = 1;

    // Filtros por rol de usuario
    if (user.role === 'vendedor_comercial') {
      where.push(`vendedor_id = $${paramIndex}`);
      params.push(user.id);
      paramIndex++;
    } else if (user.role === 'usuario_laboratorio') {
      where.push(`laboratorio_id = $${paramIndex}`);
      params.push(user.id);
      paramIndex++;
    } else if (user.role !== 'jefa_comercial' && user.role !== 'jefe_laboratorio' && user.role !== 'admin') {
      return { rows: [], total: 0 };
    }

    // Búsqueda en múltiples campos
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where.push(`(LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(location) LIKE LOWER($${paramIndex + 1}))`);
      paramIndex += 2;
    }

    // Filtro por estado
    if (status) {
      where.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Filtro por empresa
    if (company_id) {
      where.push(`company_id = $${paramIndex}`);
      params.push(company_id);
      paramIndex++;
    }

    // Filtro por tipo de proyecto
    if (project_type) {
      where.push(`project_type = $${paramIndex}`);
      params.push(project_type);
      paramIndex++;
    }

    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);

    // Query con JOINs para obtener información de empresa y usuarios
    const data = await pool.query(`
      SELECT 
        p.*,
        c.name as company_name,
        c.ruc as company_ruc,
        v.name as vendedor_name,
        l.name as laboratorio_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN users l ON p.laboratorio_id = l.id
      ${whereClause}
      ORDER BY p.id DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    // Total con filtros
    let totalParams = params.slice(0, params.length - 2);
    const total = await pool.query(`
      SELECT COUNT(*) FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN users l ON p.laboratorio_id = l.id
      ${whereClause}
    `, totalParams);

    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async getById(id, user) {
    // Solo acceso si el usuario tiene permiso
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = res.rows[0];
    if (!project) return null;
    if (
      user.role === 'jefa_comercial' ||
      user.role === 'jefe_laboratorio' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id) ||
      (user.role === 'usuario_laboratorio' && project.laboratorio_id === user.id)
    ) {
      return project;
    }
    return null;
  },
  async create({ company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio = false, requiere_ingenieria = false, contact_name, contact_phone, contact_email }) {
    const res = await pool.query(
      'INSERT INTO projects (company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria, contact_name, contact_phone, contact_email, laboratorio_status, ingenieria_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [company_id, name, location, vendedor_id, laboratorio_id, requiere_laboratorio, requiere_ingenieria, contact_name, contact_phone, contact_email, requiere_laboratorio ? 'pendiente' : 'no_requerido', requiere_ingenieria ? 'pendiente' : 'no_requerido']
    );
    return res.rows[0];
  },
  async updateStatus(id, { status, laboratorio_status, ingenieria_status, status_notes }) {
    const res = await pool.query(
      'UPDATE projects SET status = $1, laboratorio_status = $2, ingenieria_status = $3, status_notes = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [status, laboratorio_status, ingenieria_status, status_notes, id]
    );
    return res.rows[0];
  },

  async update(id, { name, location }, user) {
    // Solo el vendedor asignado o jefa comercial puede editar
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = res.rows[0];
    if (!project) return null;
    if (
      user.role === 'jefa_comercial' ||
      (user.role === 'vendedor_comercial' && project.vendedor_id === user.id)
    ) {
      const updated = await pool.query(
        'UPDATE projects SET name = $1, location = $2 WHERE id = $3 RETURNING *',
        [name, location, id]
      );
      return updated.rows[0];
    }
    return null;
  },
  async delete(id, user) {
    // Solo jefa comercial puede eliminar
    if (user.role !== 'jefa_comercial') return false;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return true;
  },

  async getStats(user) {
    try {
      console.log('📊 Project.getStats - Obteniendo estadísticas de proyectos...');
      
      let whereClause = '';
      let params = [];
      
      // Filtros por rol de usuario
      if (user.role === 'vendedor_comercial') {
        whereClause = 'WHERE vendedor_id = $1';
        params = [user.id];
      } else if (user.role === 'usuario_laboratorio') {
        whereClause = 'WHERE laboratorio_id = $1';
        params = [user.id];
      } else if (user.role !== 'jefa_comercial' && user.role !== 'jefe_laboratorio' && user.role !== 'admin') {
        return {
          total: 0,
          activos: 0,
          completados: 0,
          pendientes: 0,
          cancelados: 0
        };
      }

      // Estadísticas por estado
      const statusStats = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM projects 
        ${whereClause}
        GROUP BY status
      `, params);

      // Total de proyectos
      const totalResult = await pool.query(`
        SELECT COUNT(*) as total FROM projects ${whereClause}
      `, params);

      const total = parseInt(totalResult.rows[0].total);
      
      const stats = {
        total: total,
        activos: 0,
        completados: 0,
        pendientes: 0,
        cancelados: 0,
        byStatus: {}
      };

      statusStats.rows.forEach(row => {
        const status = row.status || 'pendiente'; // Default status
        const count = parseInt(row.count);
        stats.byStatus[status] = count;
        
        if (status === 'activo') {
          stats.activos = count;
        } else if (status === 'completado') {
          stats.completados = count;
        } else if (status === 'pendiente') {
          stats.pendientes = count;
        } else if (status === 'cancelado') {
          stats.cancelados = count;
        }
      });

      console.log('✅ Project.getStats - Estadísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Project.getStats - Error:', error);
      throw error;
    }
  },
};

module.exports = Project;
