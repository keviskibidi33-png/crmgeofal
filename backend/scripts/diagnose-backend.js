const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

console.log('🔍 Diagnóstico del backend...');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'No configurado');

// Verificar módulos
try {
  const pool = require('../config/db');
  console.log('✅ Configuración de base de datos: OK');
} catch (error) {
  console.error('❌ Error en configuración de base de datos:', error.message);
}

try {
  const TicketComment = require('../models/ticketComment');
  console.log('✅ Modelo TicketComment: OK');
} catch (error) {
  console.error('❌ Error en modelo TicketComment:', error.message);
}

try {
  const Ticket = require('../models/ticket');
  console.log('✅ Modelo Ticket: OK');
} catch (error) {
  console.error('❌ Error en modelo Ticket:', error.message);
}

try {
  const { sendNotification } = require('../services/notificationService');
  console.log('✅ Servicio de notificaciones: OK');
} catch (error) {
  console.error('❌ Error en servicio de notificaciones:', error.message);
}

// Crear app Express simple para probar
const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticación simple
const authMiddleware = (req, res, next) => {
  console.log('🔐 Middleware de autenticación ejecutándose...');
  console.log('🔐 Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('🔐 Token presente:', !!token);
  
  if (!token) {
    console.log('❌ No hay token');
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'test';
    console.log('🔐 Verificando token con secreto:', secret);
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token válido:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token inválido:', err.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Ruta de prueba simple
app.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando' });
});

// Ruta de prueba para comentarios
app.post('/api/ticket-comments', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Ruta de comentarios ejecutándose...');
    console.log('🔍 Body:', req.body);
    console.log('🔍 User:', req.user);
    
    const { ticket_id, comment } = req.body;
    const user_id = req.user.id;
    
    console.log('🔍 Datos extraídos:', { ticket_id, comment, user_id });
    
    // Simular respuesta exitosa
    const mockComment = {
      id: Date.now(),
      ticket_id,
      user_id,
      comment,
      is_system: false,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Comentario simulado creado:', mockComment);
    
    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comment: mockComment
    });
    
  } catch (error) {
    console.error('❌ Error en ruta de comentarios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

const PORT = 4002; // Puerto diferente
app.listen(PORT, () => {
  console.log(`🧪 Servidor de diagnóstico corriendo en puerto ${PORT}`);
  console.log('🔗 Prueba con: POST http://localhost:4002/api/ticket-comments');
  console.log('🔗 Test con: GET http://localhost:4002/test');
});
