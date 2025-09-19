import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Ajustes.css';

const Ajustes = () => {
  const { user, logout } = useAuth();
  return (
    <div className="ajustes-container">
      <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>👤 Mi Cuenta</h2>
      <div className="ajustes-card" style={{ fontSize: '1.15rem' }}>
        <div><span role="img" aria-label="user">🧑‍💼</span> <strong>Nombre:</strong> {user?.name}</div>
        <div><span role="img" aria-label="email">📧</span> <strong>Email:</strong> {user?.email}</div>
        <div><span role="img" aria-label="role">🛡️</span> <strong>Rol:</strong> {user?.role}</div>
      </div>
      <button className="logout-btn" onClick={logout} style={{ marginTop: 12, fontSize: '1.1rem' }}>🚪 Cerrar sesión</button>
      <div style={{ marginTop: 32, color: '#888', fontSize: '0.98rem', textAlign: 'center' }}>
        <span role="img" aria-label="info">ℹ️</span> Tus datos personales están protegidos y solo visibles para ti.
      </div>
    </div>
  );
};

export default Ajustes;
