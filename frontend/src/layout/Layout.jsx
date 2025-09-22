import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="d-flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content flex-grow-1">
          <Container fluid className="py-4">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default Layout;
