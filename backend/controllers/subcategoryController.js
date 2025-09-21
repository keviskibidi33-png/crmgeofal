const Subcategory = require('../models/subcategory');

exports.getAllByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = req.query.q;
    const { rows, total } = await Subcategory.getAllByCategory(req.params.category_id, { q, page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
};

exports.create = async (req, res) => {
  try {
    const { category_id, name } = req.body;
    const subcategory = await Subcategory.create({ category_id, name });
    res.status(201).json(subcategory);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una subcategoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const subcategory = await Subcategory.update(req.params.id, { name });
    res.json(subcategory);
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una subcategoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar subcategoría' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Subcategory.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
};
