const Company = require('../models/company');
const Audit = require('../models/audit');

// Listar empresas con paginación y filtros
const listCompanies = async (req, res) => {
  try {
    console.log('🔍 listCompanies - Llamando a:', req.url);
    console.log('🔍 listCompanies - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const { page = 1, limit = 20, search = '', type = '', city = '', sector = '' } = req.query;
    
    const result = await Company.getAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      type,
      city,
      sector
    });
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ listCompanies - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de empresas
const getCompanyStats = async (req, res) => {
  try {
    console.log('📊 getCompanyStats - Llamando a:', req.url);
    console.log('📊 getCompanyStats - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const stats = await Company.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ getCompanyStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener opciones de filtros
const getCompanyFilterOptions = async (req, res) => {
  try {
    console.log('🔍 getCompanyFilterOptions - Llamando a:', req.url);
    console.log('🔍 getCompanyFilterOptions - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const options = await Company.getFilterOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('❌ getCompanyFilterOptions - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar empresas/personas por tipo y texto
const searchCompanies = async (req, res) => {
  try {
    const { type, q } = req.query;
    
    if (!type || !q) {
      return res.status(400).json({
        success: false,
        message: 'Tipo y término de búsqueda son requeridos'
      });
    }

    const results = await Company.searchByType(type, q);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error en búsqueda de empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear empresa
const createCompany = async (req, res) => {
  try {
    const { 
      type = 'empresa',
      ruc, 
      name, 
      address, 
      email, 
      phone, 
      contact_name, 
      city, 
      sector,
      dni
    } = req.body;
    
    // Validaciones obligatorias
    if (!ruc || !name) {
      return res.status(400).json({ 
        error: 'RUC y nombre son campos obligatorios' 
      });
    }
    
    // Verificar si ya existe una empresa con ese RUC
    const existingCompany = await Company.getByRuc(ruc);
    if (existingCompany) {
      return res.status(400).json({ 
        error: 'Ya existe una empresa con ese RUC' 
      });
    }
    
    const company = await Company.create({
      type,
      ruc,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector,
      dni
    });
    
    // Auditoría
    await Audit.log({
      user_id: req.user?.id,
      action: 'crear',
      entity: 'company',
      entity_id: company.id,
      details: JSON.stringify({ ruc, name, contact_name })
    });
    
    res.status(201).json(company);
  } catch (err) {
    console.error('❌ createCompany - Error:', err);
    res.status(500).json({ error: 'Error al crear empresa' });
  }
};

module.exports = {
  listCompanies,
  getCompanyStats,
  getCompanyFilterOptions,
  searchCompanies,
  createCompany
};