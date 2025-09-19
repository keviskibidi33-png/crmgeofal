const AuditQuote = require('../models/auditQuote');

exports.getAll = async (req, res) => {
  try {
    // Solo jefes y sistemas pueden ver
    if (!req.user || !['admin','sistemas','jefa_comercial','jefe_laboratorio'].includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { page, limit } = req.query;
    const result = await AuditQuote.getAll({ page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
};
