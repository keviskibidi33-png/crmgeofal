import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [show, setShow] = useState(Boolean(message));
  
  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        // Llamar onClose después de que se oculte visualmente
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Tiempo para la animación de salida
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [message, duration, onClose]);

  // No mostrar si no hay mensaje o no está visible
  if (!message || !show) return null;

  const bg = type === 'error' ? '#f5222d' : type === 'warning' ? '#faad14' : type === 'info' ? '#1890ff' : '#52c41a';
  
  return (
    <div 
      style={{ 
        position: 'fixed', 
        right: 16, 
        bottom: 16, 
        background: bg, 
        color: '#fff', 
        padding: '12px 16px', 
        borderRadius: 8, 
        boxShadow: '0 6px 14px rgba(0,0,0,0.2)', 
        zIndex: 9999, 
        maxWidth: 360,
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease-in-out',
        transform: show ? 'translateX(0)' : 'translateX(100%)',
        opacity: show ? 1 : 0
      }}
    >
      {message}
    </div>
  );
}
