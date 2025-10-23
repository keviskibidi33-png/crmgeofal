const pool = require('../config/db');

const Ensayo = {
  // Obtener todos los ensayos con filtros
  async getAll({ search = '', categoria = '', ubicacion = '', page = 1, limit = 50 }) {
    try {
      const offset = (page - 1) * limit;
      let whereConditions = ['e.is_active = true'];
      let queryParams = [];
      let paramIndex = 1;

      // Filtro por búsqueda
      if (search) {
        whereConditions.push(`(LOWER(e.codigo) LIKE LOWER($${paramIndex}) OR LOWER(e.descripcion) LIKE LOWER($${paramIndex}) OR LOWER(e.norma) LIKE LOWER($${paramIndex}))`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      // Filtro por categoría
      if (categoria) {
        whereConditions.push(`e.categoria = $${paramIndex}`);
        queryParams.push(categoria);
        paramIndex++;
      }

      // Filtro por ubicación
      if (ubicacion) {
        whereConditions.push(`e.ubicacion = $${paramIndex}`);
        queryParams.push(ubicacion);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Query principal
      const dataQuery = `
        SELECT 
          e.id,
          e.codigo,
          e.descripcion,
          e.norma,
          e.referencia_otra_norma,
          e.ubicacion,
          e.precio,
          e.comentarios,
          e.nota_comercial,
          e.categoria,
          e.ensayos_requeridos,
          e.created_at,
          e.updated_at
        FROM ensayos e
        ${whereClause}
        ORDER BY e.categoria, e.codigo
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ensayos e
        ${whereClause}
      `;

      const data = await pool.query(dataQuery, queryParams);
      const total = await pool.query(countQuery, queryParams.slice(0, -2));

      return {
        rows: data.rows,
        total: parseInt(total.rows[0].total)
      };
    } catch (error) {
      console.error('Error obteniendo ensayos:', error);
      throw error;
    }
  },

  // Obtener ensayo por código
  async getByCodigo(codigo) {
    try {
      const result = await pool.query(`
        SELECT 
          e.id,
          e.codigo,
          e.descripcion,
          e.norma,
          e.referencia_otra_norma,
          e.ubicacion,
          e.precio,
          e.comentarios,
          e.nota_comercial,
          e.categoria,
          e.ensayos_requeridos,
          e.created_at,
          e.updated_at
        FROM ensayos e
        WHERE e.codigo = $1 AND e.is_active = true
      `, [codigo]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo ensayo por código:', error);
      throw error;
    }
  },

  // Obtener ensayos requeridos para un ensayo específico
  async getEnsayosRequeridos(codigo) {
    try {
      const ensayo = await this.getByCodigo(codigo);
      if (!ensayo || !ensayo.ensayos_requeridos) {
        return [];
      }

      const codigosRequeridos = ensayo.ensayos_requeridos.split(',').map(c => c.trim());
      const result = await pool.query(`
        SELECT codigo, descripcion, precio
        FROM ensayos
        WHERE codigo = ANY($1) AND is_active = true
        ORDER BY codigo
      `, [codigosRequeridos]);

      return result.rows;
    } catch (error) {
      console.error('Error obteniendo ensayos requeridos:', error);
      throw error;
    }
  },

  // Crear nuevo ensayo
  async create(ensayoData) {
    try {
      const {
        codigo,
        descripcion,
        norma,
        referencia_otra_norma,
        ubicacion,
        precio,
        comentarios,
        nota_comercial,
        categoria,
        ensayos_requeridos
      } = ensayoData;

      const result = await pool.query(`
        INSERT INTO ensayos (
          codigo, descripcion, norma, referencia_otra_norma, ubicacion, 
          precio, comentarios, nota_comercial, categoria, ensayos_requeridos
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        codigo, descripcion, norma, referencia_otra_norma, ubicacion,
        precio, comentarios, nota_comercial, categoria, ensayos_requeridos
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creando ensayo:', error);
      throw error;
    }
  },

  // Actualizar ensayo
  async update(id, ensayoData) {
    try {
      const {
        codigo,
        descripcion,
        norma,
        referencia_otra_norma,
        ubicacion,
        precio,
        comentarios,
        nota_comercial,
        categoria,
        ensayos_requeridos
      } = ensayoData;

      const result = await pool.query(`
        UPDATE ensayos 
        SET codigo = $1, descripcion = $2, norma = $3, referencia_otra_norma = $4,
            ubicacion = $5, precio = $6, comentarios = $7, nota_comercial = $8,
            categoria = $9, ensayos_requeridos = $10, updated_at = NOW()
        WHERE id = $11
        RETURNING *
      `, [
        codigo, descripcion, norma, referencia_otra_norma, ubicacion,
        precio, comentarios, nota_comercial, categoria, ensayos_requeridos, id
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando ensayo:', error);
      throw error;
    }
  },

  // Actualizar precio de un ensayo
  async updatePrecio(codigo, nuevoPrecio) {
    try {
      const result = await pool.query(`
        UPDATE ensayos 
        SET precio = $1, updated_at = NOW()
        WHERE codigo = $2
        RETURNING codigo, descripcion, precio
      `, [nuevoPrecio, codigo]);

      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando precio:', error);
      throw error;
    }
  },

  // Actualizar múltiples precios
  async updatePreciosMasivos(actualizaciones) {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');

      try {
        const resultados = [];
        
        for (const { codigo, precio } of actualizaciones) {
          const result = await client.query(`
            UPDATE ensayos 
            SET precio = $1, updated_at = NOW()
            WHERE codigo = $2
            RETURNING codigo, descripcion, precio
          `, [precio, codigo]);
          
          if (result.rows.length > 0) {
            resultados.push(result.rows[0]);
          }
        }

        await client.query('COMMIT');
        return resultados;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error actualizando precios masivos:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStats() {
    try {
      const totalEnsayos = await pool.query('SELECT COUNT(*) as total FROM ensayos WHERE is_active = true');
      const porCategoria = await pool.query(`
        SELECT categoria, COUNT(*) as cantidad, AVG(precio) as precio_promedio
        FROM ensayos 
        WHERE is_active = true
        GROUP BY categoria
        ORDER BY cantidad DESC
      `);
      const porUbicacion = await pool.query(`
        SELECT ubicacion, COUNT(*) as cantidad
        FROM ensayos 
        WHERE is_active = true
        GROUP BY ubicacion
        ORDER BY cantidad DESC
      `);

      return {
        totalEnsayos: parseInt(totalEnsayos.rows[0].total),
        porCategoria: porCategoria.rows,
        porUbicacion: porUbicacion.rows
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Buscar ensayos para cotización
  async searchForQuote(query) {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const result = await pool.query(`
        SELECT 
          codigo,
          descripcion,
          precio,
          ubicacion,
          categoria,
          ensayos_requeridos
        FROM ensayos
        WHERE is_active = true 
          AND (LOWER(codigo) LIKE $1 OR LOWER(descripcion) LIKE $1)
        ORDER BY 
          CASE 
            WHEN LOWER(codigo) = LOWER($2) THEN 1
            WHEN LOWER(codigo) LIKE LOWER($2) || '%' THEN 2
            ELSE 3
          END,
          codigo
        LIMIT 20
      `, [searchTerm, query]);

      return result.rows;
    } catch (error) {
      console.error('Error buscando ensayos para cotización:', error);
      throw error;
    }
  }
};

module.exports = Ensayo;
