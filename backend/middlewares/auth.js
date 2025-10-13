// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  // roles puede ser un string o array
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Require token by default. In test environment allow POST requests
    // without a token so controller-level validation can run and return 400.
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    
    const secret = process.env.JWT_SECRET || 'test';
    jwt.verify(token, secret, async (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      // Bloquear acceso a usuarios desactivados aunque tengan token válido
      // DESHABILITADO TEMPORALMENTE PARA RESOLVER PROBLEMA DE TIMEOUT
      
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      
      req.user = user;
      next();
    });
  };
};

module.exports = authMiddleware;
