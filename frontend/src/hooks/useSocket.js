import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';

export const useSocket = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (!user || !token) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    // Conectar al WebSocket
    const socket = socketService.connect(token);

    // Configurar listeners
    const handleConnectionStatus = (data) => {
      setIsConnected(data.connected);
      if (!data.connected) {
        setConnectionError(data.reason || 'Desconectado');
      } else {
        setConnectionError(null);
      }
    };

    const handleConnectionError = (error) => {
      setConnectionError(error.message || 'Error de conexión');
      setIsConnected(false);
    };

    // Registrar listeners
    socketService.on('connection_status', handleConnectionStatus);
    socketService.on('connection_error', handleConnectionError);

    // Guardar referencias para limpieza
    listenersRef.current.set('connection_status', handleConnectionStatus);
    listenersRef.current.set('connection_error', handleConnectionError);

    return () => {
      // Limpiar listeners
      listenersRef.current.forEach((callback, event) => {
        socketService.off(event, callback);
      });
      listenersRef.current.clear();
    };
  }, [user, token]);

  return {
    isConnected,
    connectionError,
    socket: socketService.getConnectionStatus().socket
  };
};

export const useSocketNotification = (onNewNotification, onCountUpdate) => {
  const { user } = useAuth();
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification) => {
      if (onNewNotification) {
        onNewNotification(notification);
      }
    };

    const handleCountUpdate = (data) => {
      if (onCountUpdate) {
        onCountUpdate(data);
      }
    };

    // Registrar listeners
    socketService.on('new_notification', handleNewNotification);
    socketService.on('notification_count_update', handleCountUpdate);

    // Guardar referencias para limpieza
    listenersRef.current.set('new_notification', handleNewNotification);
    listenersRef.current.set('notification_count_update', handleCountUpdate);

    return () => {
      // Limpiar listeners
      listenersRef.current.forEach((callback, event) => {
        socketService.off(event, callback);
      });
      listenersRef.current.clear();
    };
  }, [user, onNewNotification, onCountUpdate]);
};

export default useSocket;
