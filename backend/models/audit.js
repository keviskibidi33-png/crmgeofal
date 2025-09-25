const pool = require('../config/db');

const Audit = {
  async log({ user_id, action, entity, entity_id, details }) {
    await pool.query(
      'INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [user_id, action, entity, entity_id, details]
    );
  },

  async getAll({ page = 1, limit = 20, search, action, user, date, dateStart, dateEnd, timeStart, timeEnd }) {
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Construir condiciones WHERE dinámicamente
    if (search) {
      whereConditions.push(`(details ILIKE $${paramIndex} OR action ILIKE $${paramIndex} OR entity ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (action) {
      whereConditions.push(`action = $${paramIndex}`);
      queryParams.push(action);
      paramIndex++;
    }

    if (user) {
      whereConditions.push(`user_id = $${paramIndex}`);
      queryParams.push(user);
      paramIndex++;
    }

    // Filtros de fecha
    if (date) {
      const now = new Date();
      let dateCondition = '';
      
      switch (date) {
        case 'today':
          dateCondition = `DATE(created_at) = CURRENT_DATE`;
          break;
        case 'yesterday':
          dateCondition = `DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'`;
          break;
        case 'week':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
        case 'quarter':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '90 days'`;
          break;
        case 'year':
          dateCondition = `created_at >= CURRENT_DATE - INTERVAL '365 days'`;
          break;
      }
      
      if (dateCondition) {
        whereConditions.push(dateCondition);
      }
    }

    // Fechas personalizadas
    if (dateStart) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(dateStart);
      paramIndex++;
    }

    if (dateEnd) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(dateEnd);
      paramIndex++;
    }

    // Filtros de hora
    if (timeStart) {
      whereConditions.push(`EXTRACT(HOUR FROM created_at) >= $${paramIndex}`);
      queryParams.push(timeStart);
      paramIndex++;
    }

    if (timeEnd) {
      whereConditions.push(`EXTRACT(HOUR FROM created_at) <= $${paramIndex}`);
      queryParams.push(timeEnd);
      paramIndex++;
    }

    // Construir query final
    let baseQuery = `
      SELECT al.*, u.name as user_name, u.username, u.full_name
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
    `;

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Query para obtener total
    let countQuery = `SELECT COUNT(*) FROM audit_log al`;
    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const data = await pool.query(baseQuery, queryParams);
    const total = await pool.query(countQuery, queryParams.slice(0, -2)); // Remover limit y offset

    return { 
      rows: data.rows, 
      total: parseInt(total.rows[0].count) 
    };
  },

  async getAnalytics() {
    try {
      // Estadísticas básicas
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM audit_log');
      const total = parseInt(totalResult.rows[0].total);

      // Actividades de hoy
      const todayResult = await pool.query(`
        SELECT COUNT(*) as today 
        FROM audit_log 
        WHERE DATE(created_at) = CURRENT_DATE
      `);
      const todayActivities = parseInt(todayResult.rows[0].today);

      // Usuarios únicos
      const uniqueUsersResult = await pool.query(`
        SELECT COUNT(DISTINCT user_id) as unique_users 
        FROM audit_log 
        WHERE user_id IS NOT NULL
      `);
      const uniqueUsers = parseInt(uniqueUsersResult.rows[0].unique_users);

      // Acciones únicas
      const uniqueActionsResult = await pool.query(`
        SELECT COUNT(DISTINCT action) as unique_actions 
        FROM audit_log
      `);
      const uniqueActions = parseInt(uniqueActionsResult.rows[0].unique_actions);

      // Actividades de las últimas 24 horas
      const last24HoursResult = await pool.query(`
        SELECT COUNT(*) as recent 
        FROM audit_log 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `);
      const recentActivities = parseInt(last24HoursResult.rows[0].recent);

      // Actividades de la última semana
      const lastWeekResult = await pool.query(`
        SELECT COUNT(*) as week 
        FROM audit_log 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);
      const weekActivities = parseInt(lastWeekResult.rows[0].week);

      // Top acciones
      const topActionsResult = await pool.query(`
        SELECT action, COUNT(*) as count 
        FROM audit_log 
        GROUP BY action 
        ORDER BY count DESC 
        LIMIT 5
      `);
      const topActions = topActionsResult.rows;

      // Actividad por usuario
      const userActivityResult = await pool.query(`
        SELECT u.name, u.username, u.full_name, COUNT(al.id) as action_count
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.user_id IS NOT NULL
        GROUP BY u.id, u.name, u.username, u.full_name
        ORDER BY action_count DESC
        LIMIT 5
      `);
      const userActivity = userActivityResult.rows;

      return {
        total,
        todayActivities,
        uniqueUsers,
        uniqueActions,
        recentActivities,
        weekActivities,
        topActions,
        userActivity
      };
    } catch (error) {
      console.error('Error en analytics:', error);
      return {
        total: 0,
        todayActivities: 0,
        uniqueUsers: 0,
        uniqueActions: 0,
        recentActivities: 0,
        weekActivities: 0,
        topActions: [],
        userActivity: []
      };
    }
  },

  async getActiveUsers() {
    try {
      const result = await pool.query(`
        SELECT DISTINCT u.id, u.name, u.username, u.full_name, u.email,
               COUNT(al.id) as action_count,
               MAX(al.created_at) as last_activity
        FROM users u
        INNER JOIN audit_log al ON u.id = al.user_id
        GROUP BY u.id, u.name, u.username, u.full_name, u.email
        ORDER BY action_count DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error en usuarios activos:', error);
      return [];
    }
  },

  async cleanup(hours = 24, executedBy = null) {
    try {
      // Obtener conteo antes de la limpieza
      const beforeResult = await pool.query('SELECT COUNT(*) as total FROM audit_log');
      const totalBefore = parseInt(beforeResult.rows[0].total);
      
      // Ejecutar limpieza
      const result = await pool.query(`
        DELETE FROM audit_log 
        WHERE created_at < NOW() - INTERVAL '${hours} hours'
      `);
      const deletedCount = result.rowCount;
      
      // Obtener conteo después de la limpieza
      const afterResult = await pool.query('SELECT COUNT(*) as total FROM audit_log');
      const totalAfter = parseInt(afterResult.rows[0].total);
      
      // Registrar la limpieza en la tabla de seguimiento
      try {
        await pool.query(`
          INSERT INTO audit_cleanup_log (hours_threshold, deleted_count, total_before, total_after, executed_by, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          hours,
          deletedCount,
          totalBefore,
          totalAfter,
          executedBy,
          `Limpieza automática ejecutada - ${deletedCount} registros eliminados`
        ]);
      } catch (trackingError) {
        console.warn('No se pudo registrar la limpieza en el log:', trackingError.message);
      }
      
      return { deletedCount };
    } catch (error) {
      console.error('Error en limpieza:', error);
      throw error;
    }
  },

  async getCleanupStats() {
    try {
      // Registros antiguos (>24h)
      const oldRecordsResult = await pool.query(`
        SELECT COUNT(*) as old_count 
        FROM audit_log 
        WHERE created_at < NOW() - INTERVAL '24 hours'
      `);
      const oldRecords = parseInt(oldRecordsResult.rows[0].old_count);

      // Total de registros
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM audit_log');
      const totalRecords = parseInt(totalResult.rows[0].total);

      // Última limpieza - intentar obtener de la tabla de seguimiento
      let lastCleanup = null;
      try {
        const lastCleanupResult = await pool.query(`
          SELECT cleanup_date, deleted_count, hours_threshold
          FROM audit_cleanup_log 
          ORDER BY cleanup_date DESC 
          LIMIT 1
        `);
        
        if (lastCleanupResult.rows.length > 0) {
          lastCleanup = lastCleanupResult.rows[0].cleanup_date;
        }
      } catch (trackingError) {
        console.warn('No se pudo obtener la última limpieza:', trackingError.message);
        // Si no existe la tabla de seguimiento, usar null
        lastCleanup = null;
      }

      return {
        oldRecords,
        totalRecords,
        lastCleanup
      };
    } catch (error) {
      console.error('Error en estadísticas de limpieza:', error);
      return {
        oldRecords: 0,
        totalRecords: 0,
        lastCleanup: null
      };
    }
  },

  async getHourlyDistribution(hours = 24) {
    try {
      const result = await pool.query(`
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as count
        FROM audit_log 
        WHERE created_at >= NOW() - INTERVAL '${hours} hours'
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      `);
      
      // Crear array completo de 24 horas con datos reales
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hourData = result.rows.find(row => parseInt(row.hour) === i);
        return {
          hour: i,
          count: hourData ? parseInt(hourData.count) : 0
        };
      });
      
      return hourlyData;
    } catch (error) {
      console.error('Error obteniendo distribución horaria:', error);
      return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    }
  },

  async export(filters, format) {
    try {
      // Por ahora, devolver datos básicos
      // En un sistema real, aquí se generaría el archivo Excel/PDF/CSV
      const { rows } = await this.getAll({ ...filters, limit: 10000 });
      
      if (format === 'csv') {
        // Generar CSV básico
        const headers = ['ID', 'Usuario', 'Acción', 'Entidad', 'Detalles', 'Fecha'];
        const csvContent = [
          headers.join(','),
          ...rows.map(row => [
            row.id,
            row.user_name || row.username || 'Sistema',
            row.action,
            row.entity || '',
            (row.details || '').replace(/,/g, ';'),
            row.created_at
          ].join(','))
        ].join('\n');
        
        return csvContent;
      }
      
      // Para Excel y PDF, devolver JSON por ahora
      return JSON.stringify(rows, null, 2);
    } catch (error) {
      console.error('Error en exportación:', error);
      throw error;
    }
  }
};

module.exports = Audit;
