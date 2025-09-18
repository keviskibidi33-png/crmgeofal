const Company = require('../models/company');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await Company.getAll({ page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

exports.getById = async (req, res) => {
  try {
    const company = await Company.getById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empresa' });
  }
};

exports.create = async (req, res) => {
  try {
    const { ruc, name, address } = req.body;
    // Validar duplicidad por RUC
    const existing = await Company.getByRuc(ruc);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una empresa con ese RUC' });
    }
    const company = await Company.create({ ruc, name, address });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear empresa' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, address } = req.body;
    const company = await Company.update(req.params.id, { name, address });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Company.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
};
