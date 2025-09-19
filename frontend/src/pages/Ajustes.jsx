import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Ajustes.css';

const Ajustes = () => {
  const { user, logout } = useAuth();
  return (
    <div className="ajustes-container">
      <h2>Mi Cuenta</h2>
      <div className="ajustes-card">
        <div><strong>Nombre:</strong> {user?.name}</div>
        <div><strong>Email:</strong> {user?.email}</div>
        <div><strong>Rol:</strong> {user?.role}</div>
      </div>
      <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default Ajustes;
