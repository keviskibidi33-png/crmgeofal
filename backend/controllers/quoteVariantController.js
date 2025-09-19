const QuoteVariant = require('../models/quoteVariant');

exports.getAll = async (req, res) => {
  try {
    const variants = await QuoteVariant.getAll({ active: req.query.active !== 'false' });
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener variantes' });
  }
};

exports.getById = async (req, res) => {
  try {
    const variant = await QuoteVariant.getById(req.params.id);
    if (!variant) return res.status(404).json({ error: 'Variante no encontrada' });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener variante' });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, title, description, conditions } = req.body;
    const variant = await QuoteVariant.create({ code, title, description, conditions });
    res.status(201).json(variant);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear variante' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, conditions, active } = req.body;
    const variant = await QuoteVariant.update(req.params.id, { title, description, conditions, active });
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar variante' });
  }
};

exports.delete = async (req, res) => {
  try {
    await QuoteVariant.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar variante' });
  }
};
