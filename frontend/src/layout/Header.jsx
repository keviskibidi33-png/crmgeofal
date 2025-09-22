import React, { useState } from 'react';
import { Navbar, Nav, Dropdown, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState(3); // Simular notificaciones

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/ajustes');
  };

  const handleSettingsClick = () => {
    navigate('/ajustes');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      jefa_comercial: 'warning',
      vendedor_comercial: 'primary',
      jefe_laboratorio: 'info',
      usuario_laboratorio: 'info',
      laboratorio: 'info',
      soporte: 'secondary',
      gerencia: 'dark',
      default: 'secondary'
    };
    return colors[role] || colors.default;
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      jefa_comercial: 'Jefa Comercial',
      vendedor_comercial: 'Vendedor Comercial',
      jefe_laboratorio: 'Jefe Laboratorio',
      usuario_laboratorio: 'Usuario Laboratorio',
      laboratorio: 'Laboratorio',
      soporte: 'Soporte Técnico',
      gerencia: 'Gerencia',
      default: role
    };
    return labels[role] || labels.default;
  };

  return (
    <Navbar bg="white" expand="lg" className="main-header border-bottom shadow-sm">
      <div className="container-fluid">
        {/* Botón del menú para móvil */}
        <Button
          variant="outline-secondary"
          className="d-lg-none me-3"
          onClick={onToggleSidebar}
        >
          <FiMenu />
        </Button>

        {/* Logo */}
        <Navbar.Brand href="/" className="fw-bold text-primary">
          <span className="text-gradient">CRMGeoFal</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {/* Notificaciones */}
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="position-relative">
                <FiBell size={18} />
                {notifications > 0 && (
                  <Badge 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {notifications}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow">
                <Dropdown.Header>Notificaciones</Dropdown.Header>
                <Dropdown.Item>
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-1">
                        <FiBell size={12} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="fw-medium">Nueva cotización</div>
                      <small className="text-muted">Hace 5 minutos</small>
                    </div>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item>
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      <div className="bg-success bg-opacity-10 rounded-circle p-1">
                        <FiBell size={12} className="text-success" />
                      </div>
                    </div>
                    <div>
                      <div className="fw-medium">Proyecto completado</div>
                      <small className="text-muted">Hace 1 hora</small>
                    </div>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-center text-primary">
                  Ver todas las notificaciones
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Perfil de usuario */}
            {user && (
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="d-flex align-items-center">
                  <div className="me-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <FiUser size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div className="fw-medium">{user.name}</div>
                    <Badge bg={getRoleBadgeColor(user.role)} className="status-badge">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu align="end" className="shadow">
                  <Dropdown.Header>
                    <div className="fw-medium">{user.name}</div>
                    <small className="text-muted">{user.email}</small>
                    <div className="mt-1">
                      <Badge bg={getRoleBadgeColor(user.role)} className="status-badge">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleProfileClick}>
                    <FiUser className="me-2" />
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleSettingsClick}>
                    <FiSettings className="me-2" />
                    Configuración
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <FiLogOut className="me-2" />
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
