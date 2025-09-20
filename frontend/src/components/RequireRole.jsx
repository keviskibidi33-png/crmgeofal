import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Simple role-based route guard
// Usage: <RequireRole roles={["admin","jefa_comercial"]}><YourComponent/></RequireRole>
export default function RequireRole({ roles = [], children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Verificando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <div style={{ padding: 24 }}>No tienes permisos para acceder a esta sección.</div>;
    }
  }
  return children;
}
