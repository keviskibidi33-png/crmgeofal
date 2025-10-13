const Company = require('../models/company');
const pool = require('../config/db');

class ExportController {
  
  /**
   * Exportar clientes a CSV
   */
  async exportClientsCSV(req, res) {
    try {
      console.log('📊 Exportando clientes a CSV...');
      
      const { filters = {} } = req.body;
      const { search, status, sector, sortBy = 'created_at', sortOrder = 'desc' } = filters;
      
      // Construir query con filtros
      let query = `
        SELECT 
          c.id,
          c.name as "Cliente",
          c.ruc as "RUC",
          c.contact_name as "Contacto",
          c.email as "Email",
          c.phone as "Teléfono",
          c.address as "Dirección",
          c.city as "Ciudad",
          c.sector as "Sector",
          c.status as "Estado",
          c.created_at as "Fecha Creación",
          c.updated_at as "Última Actualización"
        FROM companies c
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (search) {
        paramCount++;
        query += ` AND (c.name ILIKE $${paramCount} OR c.contact_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      if (status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }
      
      if (sector) {
        paramCount++;
        query += ` AND c.sector ILIKE $${paramCount}`;
        params.push(`%${sector}%`);
      }
      
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
      
      const result = await pool.query(query, params);
      const clients = result.rows;
      
      // Convertir a CSV
      const csvHeaders = Object.keys(clients[0] || {}).join(',');
      const csvRows = clients.map(client => 
        Object.values(client).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Agregar BOM para UTF-8
      res.write('\uFEFF');
      res.end(csvContent);
      
      console.log(`✅ CSV exportado: ${clients.length} clientes`);
      
    } catch (error) {
      console.error('❌ Error exportando CSV:', error);
      res.status(500).json({
        success: false,
        message: 'Error al exportar datos',
        error: error.message
      });
    }
  }

  /**
   * Exportar clientes a JSON
   */
  async exportClientsJSON(req, res) {
    try {
      console.log('📊 Exportando clientes a JSON...');
      
      const { filters = {} } = req.body;
      const { search, status, sector, sortBy = 'created_at', sortOrder = 'desc' } = filters;
      
      // Construir query con filtros
      let query = `
        SELECT 
          c.id,
          c.name,
          c.ruc,
          c.contact_name,
          c.email,
          c.phone,
          c.address,
          c.city,
          c.sector,
          c.status,
          c.created_at,
          c.updated_at
        FROM companies c
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (search) {
        paramCount++;
        query += ` AND (c.name ILIKE $${paramCount} OR c.contact_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      if (status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }
      
      if (sector) {
        paramCount++;
        query += ` AND c.sector ILIKE $${paramCount}`;
        params.push(`%${sector}%`);
      }
      
      query += ` ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
      
      const result = await pool.query(query, params);
      const clients = result.rows;
      
      // Agregar metadatos
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalRecords: clients.length,
          filters: filters,
          exportedBy: req.user.name,
          exportedByRole: req.user.role
        },
        data: clients
      };
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
      
      console.log(`✅ JSON exportado: ${clients.length} clientes`);
      
    } catch (error) {
      console.error('❌ Error exportando JSON:', error);
      res.status(500).json({
        success: false,
        message: 'Error al exportar datos',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas para exportación
   */
  async getExportStats(req, res) {
    try {
      console.log('📊 Obteniendo estadísticas para exportación...');
      
      const { filters = {} } = req.body;
      const { search, status, sector } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'prospeccion' THEN 1 END) as prospeccion,
          COUNT(CASE WHEN status = 'interesado' THEN 1 END) as interesado,
          COUNT(CASE WHEN status = 'cotizacion_enviada' THEN 1 END) as cotizacion_enviada,
          COUNT(CASE WHEN status = 'negociacion' THEN 1 END) as negociacion,
          COUNT(CASE WHEN status = 'ganado' THEN 1 END) as ganado,
          COUNT(CASE WHEN status = 'perdido' THEN 1 END) as perdido
        FROM companies c
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (search) {
        paramCount++;
        query += ` AND (c.name ILIKE $${paramCount} OR c.contact_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      if (status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(status);
      }
      
      if (sector) {
        paramCount++;
        query += ` AND c.sector ILIKE $${paramCount}`;
        params.push(`%${sector}%`);
      }
      
      const result = await pool.query(query, params);
      const stats = result.rows[0];
      
      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }
}

module.exports = new ExportController();