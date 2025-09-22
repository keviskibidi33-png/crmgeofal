const Company = require('../models/company');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const city = req.query.city || '';
    const sector = req.query.sector || '';
    
    // Agregar headers para evitar caché
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { rows, total } = await Company.getAll({ page, limit, search, type, city, sector });
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error getting companies:', err);
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
    const { type, ruc, dni, name, address, email, phone, contact_name } = req.body;
    // Validación estricta
    if (!type || !name || !address || !email || !phone || !contact_name || (type === 'empresa' && !ruc) || (type === 'persona_natural' && !dni)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    // Validar duplicidad por RUC/DNI
    if (type === 'empresa' && ruc) {
      const existing = await Company.getByRuc(ruc);
      if (existing) {
        return res.status(409).json({ error: 'Ya existe una empresa con ese RUC' });
      }
    }
    // TODO: Validar duplicidad por DNI si es persona natural
    const company = await Company.create({ type, ruc, dni, name, address, email, phone, contact_name });
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear empresa' });
  }
};

exports.update = async (req, res) => {
  try {
    const { type, ruc, dni, name, address, email, phone, contact_name } = req.body;
    if (!type || !name || !address || !email || !phone || !contact_name || (type === 'empresa' && !ruc) || (type === 'persona_natural' && !dni)) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    const company = await Company.update(req.params.id, { type, ruc, dni, name, address, email, phone, contact_name });
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

exports.getStats = async (req, res) => {
  try {
    console.log('📊 getCompanyStats - Obteniendo estadísticas de clientes...');
    
    // Agregar headers para evitar caché
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const stats = await Company.getStats();
    console.log('✅ getCompanyStats - Estadísticas obtenidas:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ getCompanyStats - Error:', err);
    res.status(500).json({ error: 'Error getting company stats: ' + err.message });
  }
};
