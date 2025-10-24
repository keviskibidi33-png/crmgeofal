const pool = require('../config/db');

// Obtener todos los subservicios (endpoint principal)
exports.getAllSubservices = async (req, res) => {
  try {
    const { serviceId, area, q, page = 1, limit = 1000 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 's.is_active = true';
    let params = [];
    let paramIndex = 1;
    
    if (serviceId) {
      whereClause += ` AND s.service_id = $${paramIndex}`;
      params.push(serviceId);
      paramIndex++;
    }
    
    if (area) {
      whereClause += ` AND serv.area = $${paramIndex}`;
      params.push(area);
      paramIndex++;
    }
    
    if (q) {
      whereClause += ` AND (
        s.codigo ILIKE $${paramIndex} OR 
        s.descripcion ILIKE $${paramIndex} OR 
        s.norma ILIKE $${paramIndex} OR
        serv.name ILIKE $${paramIndex}
      )`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    const query = `
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
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE ${whereClause}
      ORDER BY s.codigo
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    
    res.json({
      data: result.rows.map(row => ({
        id: row.id,
        codigo: row.codigo,
        descripcion: row.descripcion,
        norma: row.norma,
        precio: parseFloat(row.precio),
        service_id: row.service_id,
        is_active: row.is_active,
        service_name: row.service_name,
        area: row.area,
        created_at: row.created_at,
        updated_at: row.updated_at
      })),
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error obteniendo subservicios:', error);
    res.status(500).json({ error: 'Error al obtener subservicios' });
  }
};

// Buscar subservicios para autocompletado
exports.searchSubservices = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }

    const searchQuery = `
      SELECT 
        e.id,
        e.codigo,
        e.descripcion,
        e.norma,
        e.precio,
        e.comentarios,
        e.categoria as service_name,
        e.ubicacion as area
      FROM ensayos e
      WHERE e.is_active = true 
        AND (
          e.codigo ILIKE $1 OR 
          e.descripcion ILIKE $1 OR 
          e.norma ILIKE $1 OR
          e.categoria ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN e.codigo ILIKE $2 THEN 1
          WHEN e.descripcion ILIKE $2 THEN 2
          WHEN e.norma ILIKE $2 THEN 3
          ELSE 4
        END,
        e.codigo
      LIMIT $3
    `;

    const searchTerm = `%${q}%`;
    const exactMatch = `${q}%`;
    
    const result = await pool.query(searchQuery, [searchTerm, exactMatch, limit]);
    
    res.json({ 
      data: result.rows.map(row => ({
        id: row.id,
        codigo: row.codigo,
        descripcion: row.descripcion,
        norma: row.norma,
        precio: parseFloat(row.precio),
        comentarios: row.comentarios,
        service_name: row.service_name,
        area: row.area,
        display_text: `${row.codigo} - ${row.descripcion}`,
        search_text: `${row.codigo} ${row.descripcion} ${row.norma} ${row.service_name}`.toLowerCase()
      }))
    });
    
  } catch (error) {
    console.error('Error buscando subservicios:', error);
    res.status(500).json({ error: 'Error al buscar subservicios' });
  }
};

// Obtener subservicio por código
exports.getSubserviceByCode = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const result = await pool.query(`
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE s.codigo = $1 AND s.is_active = true
    `, [codigo]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subservicio no encontrado' });
    }
    
    const subservice = result.rows[0];
    res.json({
      data: {
        id: subservice.id,
        codigo: subservice.codigo,
        descripcion: subservice.descripcion,
        norma: subservice.norma,
        precio: parseFloat(subservice.precio),
        service_name: subservice.service_name,
        area: subservice.area
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo subservicio:', error);
    res.status(500).json({ error: 'Error al obtener subservicio' });
  }
};

// Obtener sugerencias por categoría
exports.getSuggestionsByCategory = async (req, res) => {
  try {
    const { category, limit = 5 } = req.query;
    
    let whereClause = 's.is_active = true';
    let params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      whereClause += ` AND serv.name ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }
    
    const query = `
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE ${whereClause}
      ORDER BY s.codigo
      LIMIT $${paramIndex}
    `;
    
    params.push(limit);
    
    const result = await pool.query(query, params);
    
    res.json({ 
      data: result.rows.map(row => ({
        id: row.id,
        codigo: row.codigo,
        descripcion: row.descripcion,
        norma: row.norma,
        precio: parseFloat(row.precio),
        service_name: row.service_name,
        area: row.area
      }))
    });
    
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
};