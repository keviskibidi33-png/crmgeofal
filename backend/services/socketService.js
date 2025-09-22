const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Middleware de autenticación para WebSocket
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token de autenticación requerido'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Token inválido'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Usuario ${socket.userId} conectado via WebSocket`);
      
      // Registrar usuario conectado
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Unir al usuario a una sala personalizada
      socket.join(`user_${socket.userId}`);
      
      // Unir a salas por rol
      socket.join(`role_${socket.userRole}`);

      // Manejar desconexión
      socket.on('disconnect', () => {
        console.log(`Usuario ${socket.userId} desconectado`);
        this.connectedUsers.delete(socket.userId);
      });

      // Manejar eventos personalizados
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Usuario ${socket.userId} se unió a la sala ${room}`);
      });

      socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`Usuario ${socket.userId} salió de la sala ${room}`);
      });
    });

    return this.io;
  }

  // Enviar notificación a un usuario específico
  sendNotificationToUser(userId, notification) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('new_notification', notification);
      console.log(`Notificación enviada a usuario ${userId}:`, notification.title);
    }
  }

  // Enviar notificación a todos los usuarios de un rol
  sendNotificationToRole(role, notification) {
    if (this.io) {
      this.io.to(`role_${role}`).emit('new_notification', notification);
      console.log(`Notificación enviada a rol ${role}:`, notification.title);
    }
  }

  // Enviar notificación a múltiples usuarios
  sendNotificationToUsers(userIds, notification) {
    if (this.io) {
      userIds.forEach(userId => {
        this.io.to(`user_${userId}`).emit('new_notification', notification);
      });
      console.log(`Notificación enviada a ${userIds.length} usuarios:`, notification.title);
    }
  }

  // Enviar actualización de contador de notificaciones
  updateNotificationCount(userId, count) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification_count_update', { count });
    }
  }

  // Enviar notificación de sistema a todos los usuarios
  sendSystemNotification(notification) {
    if (this.io) {
      this.io.emit('system_notification', notification);
      console.log('Notificación de sistema enviada:', notification.title);
    }
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Obtener lista de usuarios conectados
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Obtener estadísticas de conexiones
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectedUsers: this.getConnectedUsers()
    };
  }
}

// Singleton instance
const socketService = new SocketService();

module.exports = socketService;
