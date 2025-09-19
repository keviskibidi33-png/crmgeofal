const ProjectAttachment = require('../models/projectAttachment');

exports.getAllByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const attachments = await ProjectAttachment.getAllByProject(project_id);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener adjuntos' });
  }
};

const Audit = require('../models/audit');
exports.create = async (req, res) => {
  try {
    const { project_id } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const file_type = req.file ? req.file.mimetype : null;
    const description = req.body.description || null;
    if (!file_url) return res.status(400).json({ error: 'Archivo requerido' });
    const uploaded_by = req.user.id;
    const attachment = await ProjectAttachment.create({ project_id, uploaded_by, file_url, file_type, description });
    // Auditoría
    await Audit.log({
      user_id: uploaded_by,
      action: 'adjuntar',
      entity: 'project_attachment',
      entity_id: attachment.id,
      details: JSON.stringify({ project_id, file_url, file_type, description })
    });
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: 'Error al adjuntar archivo' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const deleted = await ProjectAttachment.delete(id, user_id);
    if (!deleted) return res.status(403).json({ error: 'No autorizado para eliminar este archivo' });
    // Auditoría
    await Audit.log({
      user_id,
      action: 'eliminar',
      entity: 'project_attachment',
      entity_id: id,
      details: JSON.stringify({ deleted })
    });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar adjunto' });
  }
};
