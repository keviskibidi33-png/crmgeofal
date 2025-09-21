import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 2800, onClose }) {
  const [show, setShow] = useState(Boolean(message));
  useEffect(() => {
    if (message) {
      setShow(true);
      const t = setTimeout(() => { setShow(false); onClose && onClose(); }, duration);
      return () => clearTimeout(t);
    }
  }, [message, duration, onClose]);
  if (!show || !message) return null;
  const bg = type === 'error' ? '#f5222d' : type === 'warning' ? '#faad14' : '#52c41a';
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, background: bg, color: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 6px 14px rgba(0,0,0,0.2)', zIndex: 9999, maxWidth: 360 }}>
      {message}
    </div>
  );
}
