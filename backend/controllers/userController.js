// controllers/userController.js
const User = require('../models/user');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rows, total } = await User.getAll({ page, limit });
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};


exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, notification_enabled } = req.body;
    const user = await User.create({ name, email, password, role, notification_enabled });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
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
