import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardAdmin from './DashboardAdmin';
import DashboardVentas from './DashboardVentas';
import DashboardLaboratorio from './DashboardLaboratorio';
import DashboardJefe from './DashboardJefe';
import DashboardGerencia from './DashboardGerencia';
import DashboardSoporte from './DashboardSoporte';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'admin':
      return <DashboardAdmin />;
    case 'vendedor_comercial':
      return <DashboardVentas />;
    case 'laboratorio':
      return <DashboardLaboratorio />;
    case 'jefa_comercial':
    case 'jefe_comercial':
      return <DashboardJefe />;
    case 'gerencia':
      return <DashboardGerencia />;
    case 'soporte':
      return <DashboardSoporte />;
    default:
      return <div>Bienvenido al CRMGeoFal</div>;
  }
};

export default Dashboard;
