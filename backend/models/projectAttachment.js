const pool = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

const ProjectAttachment = {
  // Obtener adjuntos de un proyecto
  async getByProject(projectId) {
    const result = await pool.query(`
      SELECT 
        pa.*,
        pc.name as category_name,
        ps.name as subcategory_name,
        u.name as uploaded_by_name
      FROM project_attachments pa
      LEFT JOIN project_categories pc ON pa.category_id = pc.id
      LEFT JOIN project_subcategories ps ON pa.subcategory_id = ps.id
      LEFT JOIN users u ON pa.uploaded_by = u.id
      WHERE pa.project_id = $1
      ORDER BY pa.created_at DESC
    `, [projectId]);
    return result.rows;
  },

  // Obtener adjunto por ID
  async getById(id) {
    const result = await pool.query(`
      SELECT 
        pa.*,
        pc.name as category_name,
        ps.name as subcategory_name,
        u.name as uploaded_by_name
      FROM project_attachments pa
      LEFT JOIN project_categories pc ON pa.category_id = pc.id
      LEFT JOIN project_subcategories ps ON pa.subcategory_id = ps.id
      LEFT JOIN users u ON pa.uploaded_by = u.id
      WHERE pa.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Crear nuevo adjunto
  async create({
    projectId,
    categoryId,
    subcategoryId,
    filename,
    originalName,
    filePath,
    fileSize,
    fileType,
    description,
    uploadedBy
  }) {
    const result = await pool.query(`
      INSERT INTO project_attachments (
        project_id, category_id, subcategory_id, filename, original_name, 
        file_path, file_size, file_type, description, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `, [projectId, categoryId, subcategoryId, filename, originalName, filePath, fileSize, fileType, description, uploadedBy]);
    return result.rows[0];
  },

  // Eliminar adjunto
  async delete(id) {
    // Primero obtener la información del archivo para eliminarlo del sistema de archivos
    const attachment = await this.getById(id);
    if (attachment) {
      try {
        await fs.unlink(attachment.file_path);
      } catch (error) {
        console.error('Error eliminando archivo:', error.message);
      }
    }

    const result = await pool.query('DELETE FROM project_attachments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Obtener estadísticas de adjuntos por proyecto
  async getStatsByProject(projectId) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        COUNT(DISTINCT category_id) as categories_with_files,
        COUNT(DISTINCT subcategory_id) as subcategories_with_files
      FROM project_attachments 
      WHERE project_id = $1
    `, [projectId]);
    return result.rows[0];
  }
};

module.exports = ProjectAttachment;