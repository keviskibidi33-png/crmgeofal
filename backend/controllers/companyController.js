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
        c.id,
        c.name,
        c.ruc,
        c.dni,
        c.type,
        c.contact_name,
        c.email,
        c.phone,
        c.city,
        c.sector,
        c.address,
        c.status,
        c.managed_by,
        c.created_at,
        u.name as managed_by_name,
        u.role as managed_by_role
      FROM companies c
      LEFT JOIN users u ON c.managed_by = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
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

// Actualizar estado de cliente
const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar que el estado sea válido
    const validStatuses = Company.getAvailableStatuses();
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido',
        validStatuses: validStatuses
      });
    }

    // Actualizar el estado
    const updatedClient = await Company.updateStatus(id, status);

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Registrar en auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'status_updated',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        old_status: req.body.old_status || 'unknown',
        new_status: status,
        client_name: updatedClient.name
      })
    });

    res.json({
      message: 'Estado actualizado correctamente',
      client: updatedClient
    });

  } catch (err) {
    console.error('Error updating client status:', err);
    res.status(500).json({ error: 'Error al actualizar estado del cliente' });
  }
};

// Actualizar gestor de cliente
const updateClientManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { managed_by } = req.body;

    // Actualizar el gestor
    const updatedClient = await Company.updateManager(id, managed_by);

    if (!updatedClient) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Registrar en auditoría
    await Audit.log({
      user_id: req.user.id,
      action: 'manager_updated',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        old_manager: req.body.old_manager || 'unknown',
        new_manager: managed_by,
        client_name: updatedClient.name
      })
    });

    res.json({
      message: 'Gestor actualizado correctamente',
      client: updatedClient
    });

  } catch (err) {
    console.error('Error updating client manager:', err);
    res.status(500).json({ error: 'Error al actualizar gestor del cliente' });
  }
};

// Obtener historial de cliente
const getClientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await Company.getClientHistory(id);

    res.json({
      success: true,
      data: history
    });

  } catch (err) {
    console.error('Error getting client history:', err);
    res.status(500).json({ error: 'Error al obtener historial del cliente' });
  }
};

// Eliminar cliente (solo admin)
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log(`🗑️ deleteCompany - Usuario ${userId} intentando eliminar cliente ${id}`);

    // Verificar que el cliente existe antes de eliminar
    const existingClient = await Company.getById(id);
    if (!existingClient) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente no encontrado' 
      });
    }

    // Eliminar el cliente
    await Company.delete(id);

    // Registrar en auditoría
    await Audit.log({
      user_id: userId,
      action: 'eliminar',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        client_name: existingClient.name,
        client_type: existingClient.type,
        client_ruc: existingClient.ruc,
        client_dni: existingClient.dni
      })
    });

    console.log(`✅ deleteCompany - Cliente ${id} eliminado exitosamente por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      deletedClient: {
        id: existingClient.id,
        name: existingClient.name,
        type: existingClient.type
      }
    });

  } catch (err) {
    console.error('❌ deleteCompany - Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar cliente' 
    });
  }
};

// Actualizar empresa
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    console.log(`🔄 updateCompany - Usuario ${userId} actualizando cliente ${id}`);

    // Verificar que la empresa existe
    const existingCompany = await Company.getById(id);
    if (!existingCompany) {
      return res.status(404).json({ 
        success: false,
        error: 'Cliente no encontrado' 
      });
    }

    // Actualizar la empresa
    const updatedCompany = await Company.update(id, updateData);

    // Auditoría
    await Audit.log({
      user_id: userId,
      action: 'actualizar',
      entity: 'company',
      entity_id: id,
      details: JSON.stringify({ 
        client_name: existingCompany.name,
        updated_fields: Object.keys(updateData)
      })
    });

    console.log(`✅ updateCompany - Cliente ${id} actualizado exitosamente por usuario ${userId}`);

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: updatedCompany
    });

  } catch (err) {
    console.error('❌ updateCompany - Error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar cliente' 
    });
  }
};

module.exports = {
  listCompanies,
  getCompanyStats,
  getCompanyFilterOptions,
  searchCompanies,
  createCompany,
  updateCompany,
  getOrCreateCompany,
  updateClientStatus,
  updateClientManager,
  getClientHistory,
  deleteCompany
};