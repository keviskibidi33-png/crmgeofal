
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Accordion, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, FiUsers, FiUser, FiFileText, FiPaperclip, 
  FiMessageSquare, FiBarChart2, FiSettings, FiLayers, FiList, 
  FiClock, FiFileText as FiInvoice, 
  FiPackage, FiCheckCircle, FiDownload, FiShield, FiChevronRight,
  FiChevronDown, FiMenu, FiX, FiHardDrive
} from 'react-icons/fi';

const sectionsByRole = {
  admin: [
    {
      title: 'General',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
      ]
    },
    {
      title: 'Gestión',
      items: [
        { path: '/usuarios', label: 'Usuarios', icon: FiUsers },
        { path: '/clientes', label: 'Clientes', icon: FiUser },
        {
          label: 'Proyectos',
          icon: FiHome,
          children: [
            { path: '/proyectos', label: 'Proyectos', icon: FiHome },
            { path: '/categorias', label: 'Categorías', icon: FiLayers },
            { path: '/subcategorias', label: 'Subcategorías', icon: FiList },
            { path: '/historial-proyectos', label: 'Historial Proyectos', icon: FiClock },
          ]
        },
        {
          label: 'Cotizaciones',
          icon: FiFileText,
          children: [
            { path: '/cotizaciones', label: 'Cotizaciones', icon: FiFileText },
            { path: '/variantes-cotizacion', label: 'Variantes Cotización', icon: FiList },
            { path: '/items-cotizacion', label: 'Items Cotización', icon: FiList },
          ]
        },
        { path: '/adjuntos', label: 'Adjuntos', icon: FiPaperclip },
        {
          label: 'Tickets',
          icon: FiMessageSquare,
          children: [
            { path: '/tickets', label: 'Tickets', icon: FiMessageSquare },
            { path: '/historial-tickets', label: 'Historial Tickets', icon: FiClock },
          ]
        },
        { path: '/recuperados', label: 'Recuperados', icon: FiCheckCircle },
        { path: '/reportes', label: 'Reportes', icon: FiBarChart2 },
        { path: '/notificaciones-whatsapp', label: 'Notificaciones WhatsApp', icon: FiMessageSquare },
        {
          label: 'Servicios',
          icon: FiSettings,
          children: [
            { path: '/servicios', label: 'Servicios', icon: FiSettings },
            { path: '/subservicios', label: 'Subservicios', icon: FiPackage },
          ]
        },
        { path: '/evidencias', label: 'Evidencias', icon: FiCheckCircle },
        { path: '/facturas', label: 'Facturas', icon: FiInvoice },
        { path: '/auditoria', label: 'Auditoría', icon: FiShield },
        { path: '/exportaciones', label: 'Exportaciones', icon: FiDownload },
        { path: '/gestion-archivos', label: 'Gestión de Archivos', icon: FiHardDrive },
      ]
    },
    {
      title: 'Cuenta',
      items: [
        { path: '/ajustes', label: 'Ajustes', icon: FiSettings },
      ]
    }
  ],
  jefa_comercial: [
    {
      title: 'General',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
      ]
    },
    {
      title: 'Gestión',
      items: [
        { path: '/clientes', label: 'Clientes', icon: FiUser },
        { path: '/proyectos', label: 'Proyectos', icon: FiHome },
        { path: '/cotizaciones', label: 'Cotizaciones', icon: FiFileText },
        { path: '/facturas', label: 'Facturas', icon: FiInvoice },
        { path: '/reportes', label: 'Reportes', icon: FiBarChart2 },
        { path: '/notificaciones-whatsapp', label: 'Notificaciones WhatsApp', icon: FiMessageSquare },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  vendedor_comercial: [
    {
      title: 'General',
      items: [ { path: '/dashboard', label: 'Dashboard', icon: FiHome } ]
    },
    {
      title: 'Gestión',
      items: [
        { path: '/clientes', label: 'Clientes', icon: FiUser },
        { path: '/proyectos', label: 'Proyectos', icon: FiHome },
        { path: '/cotizaciones', label: 'Cotizaciones', icon: FiFileText },
        { path: '/tickets', label: 'Tickets', icon: FiMessageSquare },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  jefe_laboratorio: [
    {
      title: 'Laboratorio',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/variantes-cotizacion', label: 'Variantes', icon: FiList },
        { path: '/items-cotizacion', label: 'Items', icon: FiList },
        { path: '/servicios', label: 'Servicios', icon: FiSettings },
        { path: '/subservicios', label: 'Subservicios', icon: FiPackage },
        { path: '/cotizaciones/nueva/lem', label: 'Nueva Cotización LEM', icon: FiFileText },
        { path: '/evidencias', label: 'Evidencias', icon: FiCheckCircle },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  usuario_laboratorio: [
    {
      title: 'Laboratorio',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/cotizaciones/nueva/lem', label: 'Nueva Cotización LEM', icon: FiFileText },
        { path: '/evidencias', label: 'Evidencias', icon: FiCheckCircle },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  laboratorio: [
    {
      title: 'Laboratorio',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/cotizaciones/nueva/lem', label: 'Nueva Cotización LEM', icon: FiFileText },
        { path: '/evidencias', label: 'Evidencias', icon: FiCheckCircle },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  soporte: [
    {
      title: 'Operación',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/tickets', label: 'Tickets', icon: FiMessageSquare },
        { path: '/historial-tickets', label: 'Historial Tickets', icon: FiClock },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
  gerencia: [
    {
      title: 'Dirección',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: FiHome },
        { path: '/reportes', label: 'Reportes', icon: FiBarChart2 },
        { path: '/clientes', label: 'Clientes', icon: FiUser },
        { path: '/proyectos', label: 'Proyectos', icon: FiHome },
      ]
    },
    { title: 'Cuenta', items: [ { path: '/ajustes', label: 'Ajustes', icon: FiSettings } ] },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  if (!user) return null;

  const sections = sectionsByRole[user.role] || [];

  const handleAccordion = (label) => {
    setOpenAccordion(openAccordion === label ? null : label);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const renderNavItem = (item, level = 0) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    const isAccordionOpen = openAccordion === item.label && !collapsed;

    if (item.children) {
      return (
        <div key={item.label} className="nav-item">
          <div
            className={`nav-link accordion-toggle ${collapsed ? 'collapsed' : ''}`}
            onClick={() => handleAccordion(item.label)}
            title={collapsed ? item.label : undefined}
          >
            <Icon size={20} className="nav-icon" />
            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                <FiChevronRight 
                  size={16} 
                  className={`accordion-arrow ${isAccordionOpen ? 'open' : ''}`}
                />
              </>
            )}
          </div>
          
          {isAccordionOpen && (
            <div className="nav-children">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.path} className="nav-item">
        <Link
          to={item.path}
          className={`nav-link ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
          style={{ paddingLeft: level > 0 ? `${1.5 + level * 0.5}rem` : '1rem' }}
          title={collapsed ? item.label : undefined}
        >
          <Icon size={20} className="nav-icon" />
          {!collapsed && <span className="nav-label">{item.label}</span>}
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'show' : ''}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-text">CRMGeoFal</span>
          </div>
          <Button
            variant="link"
            size="sm"
            className="collapse-btn d-none d-lg-block"
            onClick={toggleCollapse}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <FiChevronRight size={16} /> : <FiChevronDown size={16} />}
          </Button>
          <Button
            variant="link"
            size="sm"
            className="close-btn d-lg-none"
            onClick={onClose}
          >
            <FiX size={16} />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          {sections.map((section, idx) => (
            <div key={section.title || idx} className="nav-section">
              {section.title && !collapsed && (
                <div className="nav-section-title">{section.title}</div>
              )}
              <div className="nav-items">
                {section.items.map(item => renderNavItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FiUser size={16} />
            </div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
