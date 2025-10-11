const pool = require('../config/db');

const ProjectHistory = {
  async getByProject(project_id, user, { page = 1, limit = 20, search = '', action = '', date = '' }) {
    const offset = (page - 1) * limit;
    
    // Construir condiciones WHERE
    let whereConditions = ['project_id = $1'];
    let queryParams = [project_id];
    let paramIndex = 2;
    
    // Filtro por búsqueda
    if (search) {
      whereConditions.push(`(action ILIKE $${paramIndex} OR notes ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Filtro por acción
    if (action) {
      whereConditions.push(`action = $${paramIndex}`);
      queryParams.push(action);
      paramIndex++;
    }
    
    // Filtro por fecha
    if (date) {
      const now = new Date();
      let dateCondition = '';
      
      switch (date) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateCondition = `performed_at >= $${paramIndex}`;
          queryParams.push(today);
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateCondition = `performed_at >= $${paramIndex}`;
          queryParams.push(weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateCondition = `performed_at >= $${paramIndex}`;
          queryParams.push(monthAgo);
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          dateCondition = `performed_at >= $${paramIndex}`;
          queryParams.push(quarterAgo);
          break;
      }
      
      if (dateCondition) {
        whereConditions.push(dateCondition);
        paramIndex++;
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Parámetros para la consulta de datos
    const dataParams = [...queryParams, limit, offset];
    const dataParamIndex = paramIndex;
    
    // Query para obtener datos
    const dataQuery = `
      SELECT ph.*, u.name as performed_by_name, u.email as performed_by_email
      FROM project_history ph
      LEFT JOIN users u ON ph.performed_by = u.id
      WHERE ${whereClause}
      ORDER BY ph.performed_at DESC, ph.id DESC
      LIMIT $${dataParamIndex} OFFSET $${dataParamIndex + 1}
    `;
    
    // Query para contar total (sin limit y offset)
    const countQuery = `
      SELECT COUNT(*) 
      FROM project_history ph
      WHERE ${whereClause}
    `;
    
    const data = await pool.query(dataQuery, dataParams);
    const total = await pool.query(countQuery, queryParams);
    
    return { rows: data.rows, total: parseInt(total.rows[0].count) };
  },
  async add({ project_id, action, performed_by, notes }) {
    const res = await pool.query(
      'INSERT INTO project_history (project_id, action, performed_by, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [project_id, action, performed_by, notes]
    );
    return res.rows[0];
  }
};

module.exports = ProjectHistory;
