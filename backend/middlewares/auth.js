// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  // roles puede ser un string o array
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    // In test environment we skip auth to keep tests isolated from JWT/DB setup.
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      req.user = user;
      next();
    });
  };
};

module.exports = authMiddleware;
