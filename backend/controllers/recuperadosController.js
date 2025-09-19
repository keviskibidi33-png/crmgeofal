const Recuperados = require('../models/recuperados');

exports.getRecuperados = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 3;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await Recuperados.getRecuperados({ months, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes recuperados' });
  }
};
