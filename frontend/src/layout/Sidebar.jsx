

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaTachometerAlt, FaUsers, FaUser, FaBuilding, FaFileAlt, FaPaperclip, FaTicketAlt, FaChartBar, FaCog } from 'react-icons/fa';

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
        { path: '/proyectos', label: 'Proyectos', icon: <FaBuilding /> },
        { path: '/cotizaciones', label: 'Cotizaciones', icon: <FaFileAlt /> },
        { path: '/adjuntos', label: 'Adjuntos', icon: <FaPaperclip /> },
        { path: '/tickets', label: 'Tickets', icon: <FaTicketAlt /> },
        { path: '/reportes', label: 'Reportes', icon: <FaChartBar /> },
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
  aside: {
    width: 240,
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
  },
  nav: {
    flex: 1,
    marginTop: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#888',
    padding: '10px 0 4px 32px',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  li: {
    margin: 0,
  },
  link: (active) => ({
    display: 'flex',
    alignItems: 'center',
    color: active ? '#ff5722' : '#232946',
    textDecoration: 'none',
    padding: '10px 24px',
    fontSize: '1.08rem',
    borderLeft: active ? '4px solid #ff5722' : '4px solid transparent',
    background: active ? 'rgba(255,87,34,0.08)' : 'none',
    transition: 'background 0.18s, color 0.18s, border-color 0.18s',
    gap: 14,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
  }),
  icon: {
    fontSize: '1.18em',
    marginRight: 6,
    display: 'flex',
    alignItems: 'center',
    color: '#ff5722',
  },
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;
  const sections = sectionsByRole[user.role] || [];
  return (
    <aside style={sidebarStyles.aside}>
      <nav style={sidebarStyles.nav}>
        {sections.map((section, idx) => (
          <div key={section.title || idx} style={sidebarStyles.section}>
            {section.title && <div style={sidebarStyles.sectionTitle}>{section.title}</div>}
            <ul style={sidebarStyles.ul}>
              {section.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path} style={sidebarStyles.li}>
                    <Link to={item.path} style={sidebarStyles.link(active)}>
                      <span style={sidebarStyles.icon}>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
