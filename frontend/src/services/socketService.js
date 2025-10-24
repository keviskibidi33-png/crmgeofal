import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Conectar al servidor WebSocket
  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('🔄 WebSocket ya conectado, reutilizando conexión');
      return this.socket;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://sublustrous-odelia-uninsured.ngrok-free.dev';
    console.log('🔌 WebSocket - Conectando a:', backendUrl);
    console.log('🔌 WebSocket - Token:', token ? 'Presente' : 'Ausente');
    
    this.socket = io(backendUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado del servidor WebSocket:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
      this.isConnected = false;
      this.emit('connection_error', error);
    });

    // Eventos de notificaciones
    this.socket.on('new_notification', (notification) => {
      console.log('Nueva notificación recibida:', notification);
      this.emit('new_notification', notification);
    });

    this.socket.on('notification_count_update', (data) => {
      console.log('Actualización de contador:', data);
      this.emit('notification_count_update', data);
    });

    this.socket.on('system_notification', (notification) => {
      console.log('Notificación de sistema:', notification);
      this.emit('system_notification', notification);
    });

    return this.socket;
  }

  // Desconectar del servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Unirse a una sala
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', room);
    }
  }

  // Salir de una sala
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', room);
    }
  }

  // Escuchar eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Dejar de escuchar eventos
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emitir eventos internos
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en callback para evento ${event}:`, error);
        }
      });
    }
  }

  // Obtener estado de conexión
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socket: this.socket
    };
  }

  // Reconectar con nuevo token
  reconnect(token) {
    this.disconnect();
    return this.connect(token);
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
