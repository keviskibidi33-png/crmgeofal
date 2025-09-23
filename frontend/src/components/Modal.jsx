import React from 'react';

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const getCardStyle = (size, className) => {
  const baseStyle = {
    background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem'
  };

  // Si tiene className personalizado, usar estilos mínimos
  if (className) {
    return {
      ...baseStyle,
      minWidth: 340,
      maxWidth: 'none',
      width: 'auto',
      height: 'auto'
    };
  }

  // Estilos por defecto según el tamaño
  switch (size) {
    case 'sm':
      return { ...baseStyle, minWidth: 300, maxWidth: 400 };
    case 'lg':
      return { ...baseStyle, minWidth: 500, maxWidth: 800 };
    case 'xl':
      return { ...baseStyle, minWidth: 800, maxWidth: 1200 };
    default:
      return { ...baseStyle, minWidth: 340, maxWidth: 420 };
  }
};

export default function Modal({ open, onClose, children, size, className }) {
  if (!open) return null;
  
  const cardStyle = getCardStyle(size, className);
  
  return (
    <div style={modalStyle} onClick={onClose}>
      <div 
        style={cardStyle} 
        className={className}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
