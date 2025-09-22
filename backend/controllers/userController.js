// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = await User.deleteUser(userId);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const user = await User.resetPassword(userId, password);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};
// Editar usuario
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, area, notification_enabled } = req.body;
    const user = await User.updateUser(userId, { name, email, role, area, notification_enabled });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
};
// controllers/userController.js
const User = require('../models/user');


exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const area = req.query.area || '';
    const role = req.query.role || '';
    
    // Agregar headers para evitar caché
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { rows, total } = await User.getAll({ page, limit, search, area, role });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.getAreas = async (req, res) => {
  try {
    const areas = await User.getAreas();
    res.json({ areas });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching areas' });
  }
};


exports.createUser = async (req, res) => {
  try {
    console.log('🔍 createUser - Datos recibidos:', req.body);
    
    const { name, apellido, email, password, role, area, notification_enabled } = req.body;
    
    // Basic validation: required fields
    if (!name || !email || !password) {
      console.log('❌ createUser - Campos faltantes:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ error: 'Campos requeridos: name, email, password' });
    }
    
    console.log('✅ createUser - Creando usuario con datos:', { name, apellido, email, role, area });
    
    const user = await User.create({ 
      name, 
      apellido, 
      email, 
      password, 
      role, 
      area, 
      notification_enabled: notification_enabled || true 
    });
    
    console.log('✅ createUser - Usuario creado exitosamente:', user);
    res.status(201).json(user);
  } catch (err) {
    console.error('❌ createUser - Error:', err.message);
    res.status(500).json({ error: 'Error creating user: ' + err.message });
  }
};

exports.setNotificationEnabled = async (req, res) => {
  try {
    const userId = req.params.id;
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'El campo enabled debe ser booleano' });
    }
    const user = await User.setNotificationEnabled(userId, enabled);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando preferencia de notificación' });
  }
};
