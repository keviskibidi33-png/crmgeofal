const pool = require('../config/db');

const Service = {
  // Obtener todos los servicios
  async getAll({ type, search, page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Filtro por tipo
      if (type) {
        whereConditions.push(`type = $${paramIndex}`);
        queryParams.push(type);
        paramIndex++;
      }

      // Filtro por búsqueda
      if (search) {
        whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Construir query
      let baseQuery = `
        SELECT s.*, 
               COUNT(sub.id) as subservices_count
        FROM services s
        LEFT JOIN subservices sub ON s.id = sub.service_id
      `;

      if (whereConditions.length > 0) {
        baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      baseQuery += ` 
        GROUP BY s.id 
        ORDER BY s.name 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      // Query para obtener total
      let countQuery = `SELECT COUNT(*) FROM services s`;
      if (whereConditions.length > 0) {
        countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }

      const data = await pool.query(baseQuery, queryParams);
      const total = await pool.query(countQuery, queryParams.slice(0, -2));

      return { 
        rows: data.rows, 
        total: parseInt(total.rows[0].count) 
      };
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
      throw error;
    }
  },

  // Obtener servicio por ID
  async getById(id) {
    try {
      const result = await pool.query(`
        SELECT s.*, 
               COUNT(sub.id) as subservices_count
        FROM services s
        LEFT JOIN subservices sub ON s.id = sub.service_id
        WHERE s.id = $1
        GROUP BY s.id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo servicio:', error);
      throw error;
    }
  },

  // Obtener subservicios de un servicio
  async getSubservices(serviceId, { search, page = 1, limit = 50 }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = ['service_id = $1'];
      let queryParams = [serviceId];
      let paramIndex = 2;

      // Filtro por búsqueda
      if (search) {
        whereConditions.push(`(codigo ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Construir query
      let baseQuery = `
        SELECT * FROM subservices 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY codigo
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      // Query para obtener total
      let countQuery = `
        SELECT COUNT(*) FROM subservices 
        WHERE ${whereConditions.join(' AND ')}
      `;

      const data = await pool.query(baseQuery, queryParams);
      const total = await pool.query(countQuery, queryParams.slice(0, -2));

      return { 
        rows: data.rows, 
        total: parseInt(total.rows[0].count) 
      };
    } catch (error) {
      console.error('Error obteniendo subservicios:', error);
      throw error;
    }
  },

  // Crear nuevo servicio
  async create(serviceData) {
    try {
      const { name, description, type, norma } = serviceData;
      const result = await pool.query(`
        INSERT INTO services (name, description, type, norma, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `, [name, description, type, norma]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creando servicio:', error);
      throw error;
    }
  },

  // Actualizar servicio
  async update(id, serviceData) {
    try {
      const { name, description, type, norma } = serviceData;
      const result = await pool.query(`
        UPDATE services 
        SET name = $1, description = $2, type = $3, norma = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `, [name, description, type, norma, id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      throw error;
    }
  },

  // Eliminar servicio
  async delete(id) {
    try {
      const result = await pool.query(`
        DELETE FROM services 
        WHERE id = $1
        RETURNING *
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      throw error;
    }
  },

  // Obtener estadísticas de servicios
  async getStats() {
    try {
      // Total de servicios
      const totalServices = await pool.query('SELECT COUNT(*) as total FROM services');
      
      // Servicios por tipo
      const servicesByType = await pool.query(`
        SELECT type, COUNT(*) as count 
        FROM services 
        GROUP BY type
      `);
      
      // Total de subservicios
      const totalSubservices = await pool.query('SELECT COUNT(*) as total FROM subservices');
      
      // Subservicios por servicio
      const subservicesByService = await pool.query(`
        SELECT s.name, COUNT(sub.id) as count 
        FROM services s
        LEFT JOIN subservices sub ON s.id = sub.service_id
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 10
      `);

      return {
        totalServices: parseInt(totalServices.rows[0].total),
        totalSubservices: parseInt(totalSubservices.rows[0].total),
        servicesByType: servicesByType.rows,
        topServices: subservicesByService.rows
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

module.exports = Service;