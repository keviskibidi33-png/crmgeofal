const Category = require('../models/category');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = req.query.q;
    const { rows, total } = await Category.getAll({ q, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.update(req.params.id, { name });
    res.json(category);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};
