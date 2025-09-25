import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Button, 
  InputGroup,
  Dropdown,
  ButtonGroup,
  Badge
} from 'react-bootstrap';
import { 
  FiFilter, 
  FiCalendar, 
  FiUser, 
  FiSearch,
  FiX,
  FiClock,
  FiSettings
} from 'react-icons/fi';

export default function AuditAdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  uniqueUsers = [],
  uniqueActions = []
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (type, value) => {
    const newFilters = { ...filters };
    
    if (type === 'start') {
      newFilters.dateStart = value;
    } else if (type === 'end') {
      newFilters.dateEnd = value;
    }
    
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search && filters.search !== '') count++;
    if (filters.action && filters.action !== 'all') count++;
    if (filters.user && filters.user !== 'all') count++;
    if (filters.dateStart) count++;
    if (filters.dateEnd) count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FiFilter className="me-2" />
          Filtros de Auditoría
          {activeFiltersCount > 0 && (
            <Badge bg="primary" className="ms-2">
              {activeFiltersCount} activos
            </Badge>
          )}
        </h6>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="me-2"
          >
            <FiSettings className="me-1" />
            {showAdvanced ? 'Ocultar' : 'Avanzados'}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={onClearFilters}
            >
              <FiX className="me-1" />
              Limpiar
            </Button>
          )}
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Filtros Básicos */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Buscar:</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar en auditoría..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col md={2}>
            <Form.Group>
              <Form.Label>Acción:</Form.Label>
              <Form.Select
                value={filters.action || 'all'}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="all">Todas</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={2}>
            <Form.Group>
              <Form.Label>Usuario:</Form.Label>
              <Form.Select
                value={filters.user || 'all'}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              >
                <option value="all">Todos</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={2}>
            <Form.Group>
              <Form.Label>Rango de Fecha:</Form.Label>
              <Form.Select
                value={filters.dateRange || 'all'}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
                <option value="custom">Personalizado</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={2} className="d-flex align-items-end">
            <ButtonGroup className="w-100">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <FiFilter className="me-1" />
                {showAdvanced ? 'Menos' : 'Más'}
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        {/* Filtros Avanzados */}
        {showAdvanced && (
          <Row className="border-top pt-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Inicio:</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FiCalendar />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={filters.dateStart || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha Fin:</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FiCalendar />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    value={filters.dateEnd || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>Hora Inicio:</Form.Label>
                <Form.Control
                  type="time"
                  value={filters.timeStart || ''}
                  onChange={(e) => handleFilterChange('timeStart', e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={2}>
              <Form.Group>
                <Form.Label>Hora Fin:</Form.Label>
                <Form.Control
                  type="time"
                  value={filters.timeEnd || ''}
                  onChange={(e) => handleFilterChange('timeEnd', e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-success" 
                className="w-100"
                onClick={() => {
                  // Aplicar filtros personalizados
                  console.log('Aplicando filtros personalizados...');
                }}
              >
                <FiFilter className="me-1" />
                Aplicar
              </Button>
            </Col>
          </Row>
        )}

        {/* Filtros Activos */}
        {activeFiltersCount > 0 && (
          <Row className="mt-3">
            <Col>
              <div className="d-flex flex-wrap gap-2">
                <small className="text-muted me-2">Filtros activos:</small>
                {filters.search && (
                  <Badge bg="info" className="d-flex align-items-center">
                    Búsqueda: {filters.search}
                    <FiX 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
                {filters.action && filters.action !== 'all' && (
                  <Badge bg="primary" className="d-flex align-items-center">
                    Acción: {filters.action}
                    <FiX 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterChange('action', 'all')}
                    />
                  </Badge>
                )}
                {filters.user && filters.user !== 'all' && (
                  <Badge bg="success" className="d-flex align-items-center">
                    Usuario: {filters.user}
                    <FiX 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterChange('user', 'all')}
                    />
                  </Badge>
                )}
                {filters.dateStart && (
                  <Badge bg="warning" className="d-flex align-items-center">
                    Desde: {filters.dateStart}
                    <FiX 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterChange('dateStart', '')}
                    />
                  </Badge>
                )}
                {filters.dateEnd && (
                  <Badge bg="warning" className="d-flex align-items-center">
                    Hasta: {filters.dateEnd}
                    <FiX 
                      className="ms-1" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFilterChange('dateEnd', '')}
                    />
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
