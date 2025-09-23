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
  },

  // Obtener todos los adjuntos con información completa
  async getAllWithDetails({ page = 1, limit = 20, search = '', project_id = '', file_type = '' }) {
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let paramIndex = 1;

    // Filtro por búsqueda
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where.push(`(LOWER(pa.original_name) LIKE LOWER($${paramIndex}) OR LOWER(p.name) LIKE LOWER($${paramIndex + 1}) OR LOWER(pa.description) LIKE LOWER($${paramIndex + 2}))`);
      paramIndex += 3;
    }

    // Filtro por proyecto
    if (project_id) {
      where.push(`pa.project_id = $${paramIndex}`);
      params.push(project_id);
      paramIndex++;
    }

    // Filtro por tipo de archivo
    if (file_type) {
      where.push(`pa.file_type LIKE $${paramIndex}`);
      params.push(`%${file_type}%`);
      paramIndex++;
    }

    let whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    params.push(limit, offset);

    console.log('🔍 ProjectAttachment.getAllWithDetails - whereClause:', whereClause);
    console.log('🔍 ProjectAttachment.getAllWithDetails - params:', params);

    // Query principal con JOINs para obtener información completa
    const data = await pool.query(`
      SELECT 
        pa.*,
        p.name as project_name,
        p.location as project_location,
        p.status as project_status,
        p.priority as project_priority,
        pa.requiere_laboratorio,
        pa.requiere_ingenieria,
        pa.requiere_consultoria,
        pa.requiere_capacitacion,
        pa.requiere_auditoria,
        c.name as company_name,
        c.ruc as company_ruc,
        v.name as vendedor_name,
        v.role as vendedor_role,
        l.name as laboratorio_name,
        l.role as laboratorio_role,
        pc.name as category_name,
        ps.name as subcategory_name,
        u.name as uploaded_by_name,
        u.role as uploaded_by_role
      FROM project_attachments pa
      LEFT JOIN projects p ON pa.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN users l ON p.laboratorio_id = l.id
      LEFT JOIN project_categories pc ON pa.category_id = pc.id
      LEFT JOIN project_subcategories ps ON pa.subcategory_id = ps.id
      LEFT JOIN users u ON pa.uploaded_by = u.id
      ${whereClause}
      ORDER BY pa.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    // Total con filtros
    let totalParams = params.slice(0, params.length - 2);
    const total = await pool.query(`
      SELECT COUNT(*) FROM project_attachments pa
      LEFT JOIN projects p ON pa.project_id = p.id
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN users v ON p.vendedor_id = v.id
      LEFT JOIN users l ON p.laboratorio_id = l.id
      LEFT JOIN project_categories pc ON pa.category_id = pc.id
      LEFT JOIN project_subcategories ps ON pa.subcategory_id = ps.id
      LEFT JOIN users u ON pa.uploaded_by = u.id
      ${whereClause}
    `, totalParams);

    console.log('✅ ProjectAttachment.getAllWithDetails - Filas encontradas:', data.rows.length);
    console.log('✅ ProjectAttachment.getAllWithDetails - Total:', parseInt(total.rows[0].count));

    return { 
      data: data.rows, 
      total: parseInt(total.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(total.rows[0].count) / limit)
    };
  },

  // Actualizar adjunto
  async update(id, updateData) {
    try {
      console.log('🔄 ProjectAttachment.update - Actualizando adjunto:', id, updateData);
      
      // Construir la consulta dinámicamente
      const fields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updateData[key]);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // Agregar updated_at
      fields.push(`updated_at = NOW()`);
      
      values.push(id);
      const query = `
        UPDATE project_attachments 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      console.log('🔄 ProjectAttachment.update - Query:', query);
      console.log('🔄 ProjectAttachment.update - Values:', values);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Adjunto no encontrado');
      }

      console.log('✅ ProjectAttachment.update - Adjunto actualizado:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ ProjectAttachment.update - Error:', error);
      throw error;
    }
  }
};

module.exports = ProjectAttachment;