const Company = require('../models/company');
const Audit = require('../models/audit');

// Listar empresas con paginación y filtros
const listCompanies = async (req, res) => {
  try {
    console.log('🔍 listCompanies - Llamando a:', req.url);
    console.log('🔍 listCompanies - Token:', req.headers.authorization ? 'Presente' : 'Ausente');
    
    const { page = 1, limit = 20, search = '', type = '', city = '', sector = '' } = req.query;
    
    // Consultar datos reales de la base de datos
    const pool = require('../config/db');
    
    // Construir consulta SQL con filtros
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR contact_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    
    if (city) {
      whereConditions.push(`city = $${paramIndex}`);
      queryParams.push(city);
      paramIndex++;
    }
    
    if (sector) {
      whereConditions.push(`sector = $${paramIndex}`);
      queryParams.push(sector);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Obtener datos paginados
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        id,
        name,
        ruc,
        dni,
        type,
        contact_name,
        email,
        phone,
        city,
        sector,
        address,
        created_at
      FROM companies 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit));
    queryParams.push(offset);
    
    const dataResult = await pool.query(dataQuery, queryParams);
    const companies = dataResult.rows;
    
    console.log(`📊 listCompanies - Consultando BD: ${total} empresas encontradas, mostrando ${companies.length}`);
    console.log(`📊 listCompanies - Paginación: página ${page}, límite ${limit}, total ${total}`);
    
    // Aplicar paginación
    const paginatedCompanies = companies;
    
    res.json({
      success: true,
      data: paginatedCompanies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
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
    console.log('🔍 createCompany - Datos recibidos:', req.body);
    
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
    
    // Validaciones obligatorias según el tipo
    if (!name) {
      return res.status(400).json({ 
        error: 'El nombre es obligatorio' 
      });
    }
    
    if (type === 'empresa' && !ruc) {
      return res.status(400).json({ 
        error: 'El RUC es obligatorio para empresas' 
      });
    }
    
    if (type === 'persona' && !dni) {
      return res.status(400).json({ 
        error: 'El DNI es obligatorio para personas naturales' 
      });
    }
    
    console.log('✅ createCompany - Validaciones pasadas, tipo:', type, 'ruc:', ruc, 'dni:', dni);
    
    // Verificar si ya existe una empresa con ese RUC o DNI
    let existingCompany = null;
    if (type === 'empresa' && ruc) {
      existingCompany = await Company.getByRuc(ruc);
    } else if (type === 'persona' && dni) {
      existingCompany = await Company.getByDni(dni);
    }
    
    if (existingCompany) {
      // Si la empresa ya existe, devolver la empresa existente en lugar de error
      console.log('✅ Empresa existente encontrada, devolviendo datos existentes');
      return res.status(200).json(existingCompany);
    }
    
    console.log('🔨 createCompany - Creando empresa con datos:', {
      type,
      ruc: type === 'empresa' ? ruc : null,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector,
      dni: type === 'persona' ? dni : null
    });
    
    const company = await Company.create({
      type,
      ruc: type === 'empresa' ? ruc : null,
      name,
      address,
      email,
      phone,
      contact_name,
      city,
      sector,
      dni: type === 'persona' ? dni : null
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