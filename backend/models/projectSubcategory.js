const pool = require('../config/db');

const ProjectSubcategory = {
  // Obtener todas las subcategorías
  async getAll() {
    const result = await pool.query(`
      SELECT 
        ps.*,
        pc.name as category_name
      FROM project_subcategories ps
      JOIN project_categories pc ON ps.category_id = pc.id
      ORDER BY pc.name, ps.name
    `);
    return result.rows;
  },

  // Obtener subcategorías por categoría
  async getByCategory(categoryId) {
    const result = await pool.query(
      'SELECT * FROM project_subcategories WHERE category_id = $1 ORDER BY name',
      [categoryId]
    );
    return result.rows;
  },

  // Obtener subcategoría por ID
  async getById(id) {
    const result = await pool.query(`
      SELECT 
        ps.*,
        pc.name as category_name
      FROM project_subcategories ps
      JOIN project_categories pc ON ps.category_id = pc.id
      WHERE ps.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Crear nueva subcategoría
  async create({ categoryId, name, description }) {
    const result = await pool.query(
      'INSERT INTO project_subcategories (category_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [categoryId, name, description]
    );
    return result.rows[0];
  },

  // Actualizar subcategoría
  async update(id, { name, description }) {
    const result = await pool.query(
      'UPDATE project_subcategories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  },

  // Eliminar subcategoría
  async delete(id) {
    const result = await pool.query('DELETE FROM project_subcategories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = ProjectSubcategory;
