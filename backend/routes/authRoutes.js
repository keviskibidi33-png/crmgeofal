// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const auth = require('../middlewares/auth');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Solo permitir login si el usuario está activo
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    if (user.active === false) {
      return res.status(403).json({ error: 'Error al iniciar sesión Contactar con Soporte' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Error en login' });
  }
});

module.exports = router;
// Obtener usuario actual a partir del JWT
router.get('/me', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, name, apellido, email, phone, role, area FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

// Actualizar perfil del usuario actual
router.put('/me', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, apellido, email, phone, area } = req.body;
    
    // Validar que el email no esté en uso por otro usuario
    if (email) {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
      }
    }
    
    // Construir query dinámicamente según los campos proporcionados
    const fields = [];
    const params = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    
    if (apellido !== undefined) {
      fields.push(`apellido = $${paramIndex++}`);
      params.push(apellido);
    }
    
    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    
    if (phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    
    if (area !== undefined) {
      fields.push(`area = $${paramIndex++}`);
      params.push(area);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }
    
    // Agregar userId para la condición WHERE
    params.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, apellido, email, phone, role, area`;

    const result = await pool.query(query, params);
    const updatedUser = result.rows[0];
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ 
      message: 'Perfil actualizado exitosamente',
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});
