const pool = require('../config/db');

// Buscar subservicios para autocompletado
exports.searchSubservices = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }

    const searchQuery = `
      SELECT 
        s.id,
        s.codigo,
        s.descripcion,
        s.norma,
        s.precio,
        s.name,
        serv.name as service_name,
        serv.area
      FROM subservices s
      JOIN services serv ON s.service_id = serv.id
      WHERE s.is_active = true 
        AND (
          s.codigo ILIKE $1 OR 
          s.descripcion ILIKE $1 OR 
          s.norma ILIKE $1 OR
          serv.name ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN s.codigo ILIKE $2 THEN 1
          WHEN s.descripcion ILIKE $2 THEN 2
          WHEN s.norma ILIKE $2 THEN 3
          ELSE 4
        END,
        s.codigo
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
        s.name,
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
        s.name,
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