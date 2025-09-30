const db = require('../config/db');

// Obtener plantillas del usuario
const getTemplatesByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        t.*,
        c.name as client_name,
        u.name as created_by_name
      FROM templates t
      LEFT JOIN companies c ON t.client_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.created_by = $1
      ORDER BY t.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
};

// Crear nueva plantilla
const createTemplate = async (req, res) => {
  try {
    const { name, client_id, description, services } = req.body;
    const userId = req.user.id;
    
    const query = `
      INSERT INTO templates (name, client_id, description, services, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [name, client_id, description, JSON.stringify(services), userId]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
};

// Actualizar plantilla
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, client_id, description, services } = req.body;
    const userId = req.user.id;
    
    // Verificar que la plantilla pertenece al usuario
    const checkQuery = 'SELECT id FROM templates WHERE id = $1 AND created_by = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    const query = `
      UPDATE templates 
      SET name = $1, client_id = $2, description = $3, services = $4, updated_at = NOW()
      WHERE id = $5 AND created_by = $6
      RETURNING *
    `;
    
    const result = await db.query(query, [name, client_id, description, JSON.stringify(services), id, userId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
};

// Eliminar plantilla
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la plantilla pertenece al usuario
    const checkQuery = 'SELECT id FROM templates WHERE id = $1 AND created_by = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    const query = 'DELETE FROM templates WHERE id = $1 AND created_by = $2';
    await db.query(query, [id, userId]);
    
    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Error al eliminar plantilla' });
  }
};

// Obtener plantilla por ID
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const query = `
      SELECT 
        t.*,
        c.name as client_name,
        u.name as created_by_name
      FROM templates t
      LEFT JOIN companies c ON t.client_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1 AND t.created_by = $2
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
};

module.exports = {
  getTemplatesByUser,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateById
};
