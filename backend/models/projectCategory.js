const pool = require('../config/db');

const ProjectCategory = {
  // Obtener todas las categorías
  async getAll() {
    const result = await pool.query(`
      SELECT 
        pc.*,
        COUNT(ps.id) as subcategories_count
      FROM project_categories pc
      LEFT JOIN project_subcategories ps ON pc.id = ps.category_id
      GROUP BY pc.id, pc.name, pc.description, pc.created_at, pc.updated_at
      ORDER BY pc.name
    `);
    return result.rows;
  },

  // Obtener categoría por ID
  async getById(id) {
    const result = await pool.query('SELECT * FROM project_categories WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Crear nueva categoría
  async create({ name, description }) {
    const result = await pool.query(
      'INSERT INTO project_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  },

  // Actualizar categoría
  async update(id, { name, description }) {
    const result = await pool.query(
      'UPDATE project_categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  },

  // Eliminar categoría
  async delete(id) {
    const result = await pool.query('DELETE FROM project_categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Obtener subcategorías de una categoría
  async getSubcategories(categoryId) {
    const result = await pool.query(
      'SELECT * FROM project_subcategories WHERE category_id = $1 ORDER BY name',
      [categoryId]
    );
    return result.rows;
  }
};

module.exports = ProjectCategory;
