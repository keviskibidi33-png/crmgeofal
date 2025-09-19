

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTachometerAlt, FaUsers, FaUser, FaBuilding, FaFileAlt, FaPaperclip, FaTicketAlt, FaChartBar, FaCog, FaLayerGroup, FaListAlt, FaHistory, FaWhatsapp, FaCogs, FaFileInvoice, FaBoxes, FaList, FaCheckCircle, FaFileExport, FaShieldAlt } from 'react-icons/fa';

const sectionsByRole = {
  admin: [
    {
      title: 'General',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
      ]
    },
    {
      title: 'Gestión',
      items: [
        { path: '/usuarios', label: 'Usuarios', icon: <FaUsers /> },
        { path: '/clientes', label: 'Clientes', icon: <FaUser /> },
        {
          label: 'Proyectos',
          icon: <FaBuilding />,
          children: [
            { path: '/proyectos', label: 'Proyectos', icon: <FaBuilding /> },
            { path: '/categorias', label: 'Categorías', icon: <FaLayerGroup /> },
            { path: '/subcategorias', label: 'Subcategorías', icon: <FaListAlt /> },
            { path: '/historial-proyectos', label: 'Historial Proyectos', icon: <FaHistory /> },
          ]
        },
        // Agrupación Cotizaciones
        {
          label: 'Cotizaciones',
          icon: <FaFileAlt />,
          children: [
            { path: '/cotizaciones', label: 'Cotizaciones', icon: <FaFileAlt /> },
            { path: '/variantes-cotizacion', label: 'Variantes Cotización', icon: <FaList /> },
            { path: '/items-cotizacion', label: 'Items Cotización', icon: <FaListAlt /> },
          ]
        },
        { path: '/adjuntos', label: 'Adjuntos', icon: <FaPaperclip /> },
        {
          label: 'Tickets',
          icon: <FaTicketAlt />,
          children: [
            { path: '/tickets', label: 'Tickets', icon: <FaTicketAlt /> },
            { path: '/historial-tickets', label: 'Historial Tickets', icon: <FaHistory /> },
          ]
        },
  { path: '/recuperados', label: 'Recuperados', icon: <FaCheckCircle /> },
  { path: '/reportes', label: 'Reportes', icon: <FaChartBar /> },
        { path: '/historial-proyectos', label: 'Historial Proyectos', icon: <FaHistory /> },
        { path: '/notificaciones-whatsapp', label: 'Notificaciones WhatsApp', icon: <FaWhatsapp /> },
        // Agrupación Servicios
        {
          label: 'Servicios',
          icon: <FaCogs />,
          children: [
            { path: '/servicios', label: 'Servicios', icon: <FaCogs /> },
            { path: '/subservicios', label: 'Subservicios', icon: <FaBoxes /> },
          ]
        },
        { path: '/evidencias', label: 'Evidencias', icon: <FaCheckCircle /> },
        { path: '/facturas', label: 'Facturas', icon: <FaFileInvoice /> },
        { path: '/historial-tickets', label: 'Historial Tickets', icon: <FaHistory /> },
        { path: '/auditoria', label: 'Auditoría', icon: <FaShieldAlt /> },
        { path: '/exportaciones', label: 'Exportaciones', icon: <FaFileExport /> },
      ]
    },
    {
      title: 'Cuenta',
      items: [
        { path: '/ajustes', label: 'Ajustes', icon: <FaCog /> },
      ]
    }
  ],
  // Otros roles pueden tener otras secciones
};

const sidebarStyles = {
  aside: (collapsed) => ({
    width: collapsed ? 64 : 240,
    background: '#fff',
    color: '#232946',
    minHeight: '100vh',
    height: '100vh',
    padding: 0,
    boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '2px solid #ececec',
    zIndex: 2,
    overflow: 'hidden',
    transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
  }),
  nav: {
    flex: 1,
    marginTop: 8,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ececec #fff',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: (collapsed) => ({
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#888',
    padding: collapsed ? '10px 0 4px 0' : '10px 0 4px 32px',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'padding 0.2s',
  }),
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  li: {
    margin: 0,
  },
  link: (active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    color: active ? '#ff5722' : '#232946',
    textDecoration: 'none',
    padding: collapsed ? '10px 0 10px 0' : '10px 24px',
    fontSize: '1.08rem',
    borderLeft: active ? '4px solid #ff5722' : '4px solid transparent',
    background: active ? 'rgba(255,87,34,0.08)' : 'none',
    transition: 'background 0.18s, color 0.18s, border-color 0.18s, padding 0.2s',
    gap: collapsed ? 0 : 14,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    justifyContent: collapsed ? 'center' : 'flex-start',
  }),
  icon: (collapsed) => ({
    fontSize: '1.18em',
    marginRight: collapsed ? 0 : 6,
    display: 'flex',
    alignItems: 'center',
    color: '#ff5722',
    transition: 'margin 0.2s',
  }),
  collapseBtn: (collapsed) => ({
    width: '100%',
    border: 'none',
    background: 'none',
    color: '#ff5722',
    fontWeight: 700,
    fontSize: 22,
    padding: collapsed ? '16px 0' : '16px 0 16px 0',
    cursor: 'pointer',
    borderTop: '2px solid #ececec',
    outline: 'none',
    transition: 'background 0.18s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  })
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  if (!user) return null;
  const sections = sectionsByRole[user.role] || [];
  // Estado para controlar qué acordeón está abierto
  const [openAccordion, setOpenAccordion] = useState(null);
  const handleAccordion = (label) => {
    setOpenAccordion(openAccordion === label ? null : label);
  };
  return (
    <aside style={sidebarStyles.aside(collapsed)}>
      <nav style={sidebarStyles.nav}>
        {sections.map((section, idx) => (
          <div key={section.title || idx} style={sidebarStyles.section}>
            {section.title && !collapsed && (
              <div style={sidebarStyles.sectionTitle(collapsed)}>{section.title}</div>
            )}
            <ul style={sidebarStyles.ul}>
              {section.items.map((item) => {
                // Si el item tiene hijos, renderiza como acordeón
                if (item.children) {
                  const isOpen = openAccordion === item.label && !collapsed;
                  return (
                    <li key={item.label} style={sidebarStyles.li}>
                      <div
                        style={{ ...sidebarStyles.link(false, collapsed), userSelect: 'none', position: 'relative' }}
                        onClick={() => handleAccordion(item.label)}
                        title={collapsed ? item.label : undefined}
                      >
                        <span style={sidebarStyles.icon(collapsed)}>{item.icon}</span>
                        {!collapsed && item.label}
                        {!collapsed && (
                          <span style={{ marginLeft: 'auto', fontSize: 14, color: '#ff5722', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>&#9654;</span>
                        )}
                      </div>
                      {isOpen && (
                        <ul style={{ ...sidebarStyles.ul, background: '#faf9f6', marginLeft: 0 }}>
                          {item.children.map((child) => {
                            const active = location.pathname === child.path;
                            return (
                              <li key={child.path} style={sidebarStyles.li}>
                                <Link to={child.path} style={{ ...sidebarStyles.link(active, collapsed), paddingLeft: collapsed ? 0 : 44 }} title={collapsed ? child.label : undefined}>
                                  <span style={sidebarStyles.icon(collapsed)}>{child.icon}</span>
                                  {!collapsed && child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                // Item normal
                const active = location.pathname === item.path;
                return (
                  <li key={item.path} style={sidebarStyles.li}>
                    <Link to={item.path} style={sidebarStyles.link(active, collapsed)} title={collapsed ? item.label : undefined}>
                      <span style={sidebarStyles.icon(collapsed)}>{item.icon}</span>
                      {!collapsed && item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {/* Botón de colapsar/expandir */}
      <button
        style={sidebarStyles.collapseBtn(collapsed)}
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? <span>&#9654;</span> : <span>&#9664;</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
