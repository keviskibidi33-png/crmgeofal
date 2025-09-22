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
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        console.log('❌ Auth - Token inválido:', err.message);
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      console.log('✅ Auth - Usuario autenticado:', user.role);
      
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
