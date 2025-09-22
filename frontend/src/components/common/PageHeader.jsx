import React from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  breadcrumb = true, 
  actions = null,
  className = "" 
}) => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [{ label: 'Inicio', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      items.push({ 
        label, 
        path: currentPath,
        active: index === pathSegments.length - 1
      });
    });
    
    return items;
  };

  return (
    <div className={`page-header bg-white border-bottom ${className}`}>
      <Container fluid>
        <Row className="align-items-center py-4">
          <Col>
            {breadcrumb && (
              <Breadcrumb className="mb-2">
                {getBreadcrumbItems().map((item, index) => (
                  <Breadcrumb.Item 
                    key={index}
                    href={item.active ? undefined : item.path}
                    active={item.active}
                    className={item.active ? 'text-muted' : 'text-primary'}
                  >
                    {item.label}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}
            
            <div className="d-flex align-items-center">
              {Icon && (
                <div className="me-3">
                  <div className="icon-wrapper bg-primary bg-opacity-10 rounded-3 p-3">
                    <Icon size={24} className="text-primary" />
                  </div>
                </div>
              )}
              
              <div>
                <h1 className="h3 mb-1 fw-bold text-dark">{title}</h1>
                {subtitle && (
                  <p className="text-muted mb-0">{subtitle}</p>
                )}
              </div>
            </div>
          </Col>
          
          {actions && (
            <Col xs="auto">
              <div className="d-flex gap-2">
                {actions}
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default PageHeader;
