const Company = require('../models/company');
const Audit = require('../models/audit');

// Listar empresas con paginación y filtros
const listCompanies = async (req, res) => {
  try {
    console.log('🔍 listCompanies - Llamando a:', req.url);
    console.log('🔍 listCompanies - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const { page = 1, limit = 20, search = '', type = '', city = '', sector = '' } = req.query;
    
    // Datos de prueba para empresas/clientes
    const companies = [
      {
        id: 1,
        name: "Minera Las Bambas",
        type: "cliente",
        ruc: "20123456789",
        contact_name: "Carlos Mendoza",
        email: "carlos.mendoza@lasbambas.com",
        phone: "01-234-5678",
        city: "Lima",
        sector: "Minería",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Geología Peruana SAC",
        type: "cliente",
        ruc: "20234567890",
        contact_name: "Ana Torres",
        email: "ana.torres@geoperu.com",
        phone: "01-345-6789",
        city: "Arequipa",
        sector: "Consultoría",
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: "Estudios Ambientales Norte",
        type: "cliente",
        ruc: "20345678901",
        contact_name: "Luis Vargas",
        email: "luis.vargas@ambientalnorte.com",
        phone: "01-456-7890",
        city: "Trujillo", 
        sector: "Medio Ambiente",
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: "Constructora del Norte",
        type: "cliente",
        ruc: "20456789012",
        contact_name: "María Rodríguez",
        email: "maria.rodriguez@constructoranorte.com",
        phone: "01-567-8901",
        city: "Chiclayo",
        sector: "Construcción",
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: "Consultora GeoTech",
        type: "proveedor",
        ruc: "20567890123",
        contact_name: "Pedro Salinas",
        email: "pedro.salinas@geotech.com",
        phone: "01-678-9012",
        city: "Lima",
        sector: "Consultoría",
        created_at: new Date().toISOString()
      }
    ];
    
    // Filtrar por búsqueda si se proporciona
    let filteredCompanies = companies;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.contact_name.toLowerCase().includes(searchLower) ||
        company.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por tipo si se proporciona
    if (type) {
      filteredCompanies = filteredCompanies.filter(company => company.type === type);
    }
    
    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedCompanies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredCompanies.length,
        pages: Math.ceil(filteredCompanies.length / parseInt(limit))
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
      // Si la empresa ya existe, devolver la empresa existente en lugar de error
      console.log('✅ Empresa existente encontrada, devolviendo datos existentes');
      return res.status(200).json(existingCompany);
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

// Obtener o crear empresa (para cotizaciones)
const getOrCreateCompany = async (req, res) => {
  try {
    const { ruc, name, address, email, phone, contact_name, city, sector } = req.body;
    
    // Validaciones obligatorias
    if (!ruc || !name) {
      return res.status(400).json({ 
        error: 'RUC y nombre son campos obligatorios' 
      });
    }
    
    // Buscar empresa existente
    const existingCompany = await Company.getByRuc(ruc);
    if (existingCompany) {
      console.log('✅ Empresa existente encontrada:', existingCompany.name);
      return res.status(200).json(existingCompany);
    }
    
    // Crear nueva empresa si no existe
    const company = await Company.create({
      type: 'empresa',
      ruc,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector
    });
    
    console.log('✅ Nueva empresa creada:', company.name);
    
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
    console.error('❌ getOrCreateCompany - Error:', err);
    res.status(500).json({ error: 'Error al obtener o crear empresa' });
  }
};

module.exports = {
  listCompanies,
  getCompanyStats,
  getCompanyFilterOptions,
  searchCompanies,
  createCompany,
  getOrCreateCompany
};