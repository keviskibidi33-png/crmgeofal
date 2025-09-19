import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const layoutStyles = {
  mainLayout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f6f8fa',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    minHeight: '0',
    height: '100vh',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    padding: '1.5rem 1.5rem 0 1.5rem',
    minWidth: 0,
    background: '#f6f8fa',
    height: '100vh',
    overflowY: 'auto',
    margin: 0,
  },
};

const Layout = ({ children }) => {
  return (
    <div style={layoutStyles.mainLayout}>
      <Header />
      <div style={layoutStyles.mainContent}>
        <Sidebar />
        <div style={layoutStyles.contentArea}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
