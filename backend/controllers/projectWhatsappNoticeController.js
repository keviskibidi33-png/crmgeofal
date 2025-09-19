const ProjectWhatsappNotice = require('../models/projectWhatsappNotice');

exports.getAllByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const notices = await ProjectWhatsappNotice.getAllByProject(project_id);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avisos' });
  }
};

const Audit = require('../models/audit');
exports.create = async (req, res) => {
  try {
    const { project_id, sent_to, message } = req.body;
    const sent_by = req.user.id;
    if (!message || !sent_to) return res.status(400).json({ error: 'Mensaje y destinatario requeridos' });
    const notice = await ProjectWhatsappNotice.create({ project_id, sent_by, sent_to, message });
    // Auditoría
    await Audit.log({
      user_id: sent_by,
      action: 'avisar',
      entity: 'project_whatsapp_notice',
      entity_id: notice.id,
      details: JSON.stringify({ project_id, sent_to, message })
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar aviso' });
  }
};
