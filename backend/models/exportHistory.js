const pool = require('../config/db');

const ExportHistory = {
  async log({ user_id, type, resource, client_id = null, project_id = null, commercial_id = null, laboratory_id = null, status = 'nuevo' }) {
    await pool.query(
      'INSERT INTO export_history (user_id, type, resource, client_id, project_id, commercial_id, laboratory_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [user_id, type, resource, client_id, project_id, commercial_id, laboratory_id, status]
    );
  },
  async getAll({ page = 1, limit = 20, q = '', type = '', range = '30' }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conds = [];
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      conds.push('(LOWER(eh.resource) LIKE $' + params.length + ')');
    }
    if (type) {
      params.push(type);
      conds.push('eh.type = $' + params.length);
    }
    if (range && range !== 'all') {
      const days = Number(range) || 30;
      params.push(days);
      conds.push(`eh.created_at >= NOW() - ($${params.length}::int || ' days')::interval`);
    }
    const where = conds.length ? ('WHERE ' + conds.join(' AND ')) : '';
    
    // Consulta principal con datos
    const data = await pool.query(
      `SELECT eh.*, 
              u.name as user_name,
              c.name as client_name,
              p.name as project_name,
              comm.name as commercial_name,
              lab.name as laboratory_name
       FROM export_history eh
       LEFT JOIN users u ON u.id = eh.user_id
       LEFT JOIN companies c ON c.id = eh.client_id
       LEFT JOIN projects p ON p.id = eh.project_id
       LEFT JOIN users comm ON comm.id = eh.commercial_id
       LEFT JOIN users lab ON lab.id = eh.laboratory_id
       ${where}
       ORDER BY eh.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    
    // Consulta de conteo con los mismos parámetros
    const total = await pool.query(
      `SELECT COUNT(*) FROM export_history eh ${where}`, 
      params
    );
    
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  
  async updateStatus(id, status) {
    await pool.query(
      'UPDATE export_history SET status = $1 WHERE id = $2',
      [status, id]
    );
  },
  
  async getByClient(client_id) {
    const result = await pool.query(
      `SELECT eh.*, 
              u.name as user_name,
              c.name as client_name,
              p.name as project_name,
              comm.name as commercial_name,
              lab.name as laboratory_name
       FROM export_history eh
       LEFT JOIN users u ON u.id = eh.user_id
       LEFT JOIN companies c ON c.id = eh.client_id
       LEFT JOIN projects p ON p.id = eh.project_id
       LEFT JOIN users comm ON comm.id = eh.commercial_id
       LEFT JOIN users lab ON lab.id = eh.laboratory_id
       WHERE eh.client_id = $1
       ORDER BY eh.created_at DESC`,
      [client_id]
    );
    return result.rows;
  },
  
  async getByProject(project_id) {
    const result = await pool.query(
      `SELECT eh.*, 
              u.name as user_name,
              c.name as client_name,
              p.name as project_name,
              comm.name as commercial_name,
              lab.name as laboratory_name
       FROM export_history eh
       LEFT JOIN users u ON u.id = eh.user_id
       LEFT JOIN companies c ON c.id = eh.client_id
       LEFT JOIN projects p ON p.id = eh.project_id
       LEFT JOIN users comm ON comm.id = eh.commercial_id
       LEFT JOIN users lab ON lab.id = eh.laboratory_id
       WHERE eh.project_id = $1
       ORDER BY eh.created_at DESC`,
      [project_id]
    );
    return result.rows;
  }
};

module.exports = ExportHistory;
