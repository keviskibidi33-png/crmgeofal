// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  // roles puede ser un string o array
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔐 Auth - Ruta:', req.path);
    console.log('🔐 Auth - Token presente:', !!token);
    console.log('🔐 Auth - Roles requeridos:', roles);
    
    // Require token by default. In test environment allow POST requests
    // without a token so controller-level validation can run and return 400.
    if (!token) {
      console.log('❌ Auth - Token requerido');
      return res.status(401).json({ error: 'Token requerido' });
    }
    
    const secret = process.env.JWT_SECRET || 'test';
    console.log('🔐 Auth - Verificando token con secreto:', secret);
    jwt.verify(token, secret, async (err, user) => {
      if (err) {
        console.log('❌ Auth - Token inválido:', err.message);
        console.log('🔐 Auth - Token recibido:', token.substring(0, 50) + '...');
        console.log('🔐 Auth - Error completo:', err);
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      console.log('✅ Auth - Usuario autenticado:', user.role);

      // Bloquear acceso a usuarios desactivados aunque tengan token válido
      try {
        const pool = require('../config/db');
        const check = await pool.query('SELECT active FROM users WHERE id = $1', [user.id]);
        const isActive = check.rows[0]?.active !== false;
        if (!isActive) {
          console.log('❌ Auth - Error al iniciar sesión Contactar con Soporte:', user.id);
          return res.status(403).json({ error: 'Usuario desactivado' });
        }
      } catch (e) {
        console.log('⚠️ Auth - Error verificando estado activo:', e.message);
      }
      
      if (roles.length && !roles.includes(user.role)) {
        console.log('❌ Auth - No autorizado. Rol:', user.role, 'Requerido:', roles);
        return res.status(403).json({ error: 'No autorizado' });
      }
      
      req.user = user;
      next();
    });
  };
};

module.exports = authMiddleware;
