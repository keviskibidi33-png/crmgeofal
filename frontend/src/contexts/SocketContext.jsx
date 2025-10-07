import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = io('http://localhost:4000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Desconectado del servidor WebSocket:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    } else {
      setSocket(null);
    }
  }, []);

  const joinTicket = (ticketId) => {
    if (socket && socket.emit) {
      socket.emit('join_ticket', ticketId);
    }
  };

  const leaveTicket = (ticketId) => {
    if (socket && socket.emit) {
      socket.emit('leave_ticket', ticketId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinTicket,
    leaveTicket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
