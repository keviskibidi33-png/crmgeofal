import React from 'react';

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const cardStyle = {
  background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: '2rem 2.5rem', minWidth: 340, maxWidth: 420
};

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
