import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Alert, Card, Badge, Button, Row, Col, Spinner, Tabs, Tab, Form, InputGroup } from 'react-bootstrap';
import { 
  FiSettings, FiPackage, FiList, FiSearch, FiCode, FiFileText, FiDollarSign, FiFilter
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { listServices } from '../services/services';
import { searchSubservices, getAllSubservices } from '../services/subservices';

export default function Servicios() {
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('modules');

  const { data, isLoading } = useQuery(
    ['services'],
    () => listServices(),
    { keepPreviousData: true }
  );

  // Obtener subservicios del Laboratorio con filtros
  const { data: subservicesData, isLoading: subservicesLoading } = useQuery(
    ['subservices', 'laboratorio', searchQuery, priceFilter, categoryFilter],
    () => {
      const params = { area: 'laboratorio', limit: 1000 }; // Límite alto para obtener todos
      if (searchQuery) params.q = searchQuery;
      return getAllSubservices(params);
    },
    { keepPreviousData: true }
  );

  // Obtener subservicios de Ingeniería con filtros
  const { data: ingenieriaData, isLoading: ingenieriaLoading } = useQuery(
    ['subservices', 'ingenieria', searchQuery, priceFilter, categoryFilter],
    () => {
      const params = { area: 'ingenieria', limit: 1000 }; // Límite alto para obtener todos
      if (searchQuery) params.q = searchQuery;
      return getAllSubservices(params);
    },
    { keepPreviousData: true }
  );

  // Funciones auxiliares
  const formatPrice = (precio) => {
    // Manejar casos donde precio es null, undefined, o string
    if (precio === null || precio === undefined || precio === '') {
      return 'Sujeto a evaluación';
    }
    
    // Convertir a número si es string
    const numPrecio = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    // Verificar si es un número válido
    if (isNaN(numPrecio)) {
      return 'Sujeto a evaluación';
    }
    
    return numPrecio === 0 ? 'Sujeto a evaluación' : `S/ ${numPrecio.toFixed(2)}`;
  };

  const formatNorma = (norma) => {
    if (norma === null || norma === undefined || norma === '' || norma === '-') {
      return 'Sin norma específica';
    }
    return norma;
  };

  const getCategoryFromCode = (codigo) => {
    if (codigo.startsWith('SU')) {
      return 'ENSAYO ESTÁNDAR';
    } else if (codigo.startsWith('AG')) {
      return 'ENSAYO AGREGADO';
    } else if (codigo.startsWith('C') || codigo.startsWith('CO') || codigo.startsWith('DIS') || codigo.startsWith('COM') || codigo.startsWith('ABS')) {
      return 'ENSAYO CONCRETO';
    } else if (codigo.startsWith('ALB')) {
      return 'ENSAYO ALBAÑILERÍA';
    } else if (codigo.startsWith('R')) {
      return 'ENSAYO ROCA';
    } else if (codigo.startsWith('CEM')) {
      return 'CEMENTO';
    } else if (codigo.startsWith('PAV')) {
      return 'ENSAYO PAVIMENTO';
    } else if (codigo.startsWith('AS')) {
      return 'ENSAYO ASFALTO';
    } else if (codigo.startsWith('MA')) {
      return 'ENSAYO MEZCLA ASFÁLTICO';
    } else if (codigo.startsWith('E')) {
      return 'EVALUACIONES ESTRUCTURALES';
    } else if (codigo.startsWith('IMP')) {
      return 'IMPLEMENTACIÓN LABORATORIO';
    } else if (codigo.startsWith('SER')) {
      return 'OTROS SERVICIOS';
    } else {
      return 'OTROS';
    }
  };

  const subservices = subservicesData?.data || [];
  const totalSubservices = subservicesData?.total || 0;
  
  const ingenieriaSubservices = ingenieriaData?.data || [];
  const totalIngenieria = ingenieriaData?.total || 0;
  
  // Debug: verificar datos recibidos
  console.log('🔍 Debug subservicios:', {
    total: totalSubservices,
    received: subservices.length,
    data: subservicesData
  });

  // Filtrar subservicios por precio y categoría
  const filteredSubservices = subservices.filter(subservice => {
    // Filtro por precio
    if (priceFilter === 'fixed' && subservice.precio === 0) return false;
    if (priceFilter === 'evaluation' && subservice.precio > 0) return false;
    
    // Filtro por categoría
    if (categoryFilter !== 'all') {
      const category = getCategoryFromCode(subservice.codigo);
      if (category !== categoryFilter) return false;
    }
    
    return true;
  });

  // Filtrar subservicios de Ingeniería por precio y categoría
  const filteredIngenieriaSubservices = ingenieriaSubservices.filter(subservice => {
    // Filtro por precio
    if (priceFilter === 'fixed' && subservice.precio === 0) return false;
    if (priceFilter === 'evaluation' && subservice.precio > 0) return false;
    
    // Filtro por categoría
    if (categoryFilter !== 'all') {
      const category = getCategoryFromCode(subservice.codigo);
      if (category !== categoryFilter) return false;
    }
    
    return true;
  });

  // Obtener categorías únicas
  const categories = [...new Set(subservices.map(sub => getCategoryFromCode(sub.codigo)))].sort();

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setPriceFilter('all');
    setCategoryFilter('all');
  };



  return (
    <div className="fade-in">
      <PageHeader
        title="Servicios"
        subtitle="Módulos fijos: Laboratorio e Ingeniería"
        icon={FiSettings}
      />
      
      <Alert variant="info" className="mb-4">
        <FiSettings className="me-2" />
        Los servicios están limitados a dos módulos fijos: <strong>Laboratorio</strong> e <strong>Ingeniería</strong>.
        No se pueden crear proyectos adicionales.
      </Alert>

      {/* Pestañas */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        id="servicios-tabs"
      >
        <Tab eventKey="modules" title="Módulos">
          {/* Módulos Fijos */}
          <div className="row mb-4">
            {/* Módulo Laboratorio */}
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-primary">
                <div className="card-header bg-primary text-white d-flex align-items-center">
                  <FiSettings className="me-2" />
                  <h5 className="mb-0 text-dark">Laboratorio</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Servicios especializados en análisis, pruebas y ensayos de laboratorio 
                    para diversos materiales y muestras.
                  </p>
                  <div className="mb-3">
                    <h6 className="text-primary">Servicios Principales:</h6>
                    <ul className="list-unstyled">
                      <li>• Análisis de Suelos</li>
                      <li>• Ensayos de Materiales</li>
                      <li>• Pruebas de Calidad</li>
                      <li>• Análisis Químicos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Módulo Ingeniería */}
            <div className="col-md-6 mb-4">
              <div className="card h-100 border-success">
                <div className="card-header bg-success text-white d-flex align-items-center">
                  <FiPackage className="me-2" />
                  <h5 className="mb-0 text-dark">Ingeniería</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Servicios de consultoría, diseño y desarrollo de proyectos 
                    de ingeniería especializada.
                  </p>
                  <div className="mb-3">
                    <h6 className="text-success">Servicios Principales:</h6>
                    <ul className="list-unstyled">
                      <li>• Diseño Estructural</li>
                      <li>• Consultoría Técnica</li>
                      <li>• Proyectos de Ingeniería</li>
                      <li>• Evaluaciones Técnicas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab eventKey="subservices" title="Subservicios Laboratorio">
          {/* Buscador y Filtros */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FiSearch className="me-2" />
                Buscar y Filtrar Subservicios de Laboratorio
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Buscar por código o descripción:</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FiSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Ej: SU04, humedad..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por precio:</Form.Label>
                    <Form.Select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <option value="all">Todos los precios</option>
                      <option value="fixed">Precio fijo</option>
                      <option value="evaluation">Sujeto a evaluación</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por categoría:</Form.Label>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="w-100"
                  >
                    <FiFilter className="me-1" />
                    Limpiar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Lista de Subservicios */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiList className="me-2" />
                Subservicios del Laboratorio
                <Badge bg="info" className="ms-2">
                  {filteredSubservices.length} de {totalSubservices} subservicios
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {subservicesLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Cargando subservicios...</p>
                </div>
              ) : filteredSubservices.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th width="15%">Código</th>
                        <th width="40%">Descripción</th>
                        <th width="20%">Sección</th>
                        <th width="15%">Precio</th>
                        <th width="10%">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubservices.map((subservice) => (
                        <tr key={subservice.id}>
                          <td>
                            <Badge bg="primary" className="fs-6">
                              <FiCode className="me-1" />
                              {subservice.codigo}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-bold text-dark mb-1">
                              {subservice.descripcion}
                            </div>
                            <small className="text-muted">
                              <FiFileText className="me-1" />
                              {formatNorma(subservice.norma)}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info" className="fs-6">
                              {getCategoryFromCode(subservice.codigo)}
                            </Badge>
                          </td>
                          <td>
                            <Badge 
                              bg={subservice.precio === 0 ? 'warning' : 'success'} 
                              className="fs-6"
                            >
                              <FiDollarSign className="me-1" />
                              {formatPrice(subservice.precio)}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                            >
                              Seleccionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiList size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No hay subservicios disponibles</h6>
                  <p className="text-muted small">
                    {searchQuery || priceFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'No se encontraron subservicios con los filtros aplicados.'
                      : 'Los subservicios del Laboratorio se cargarán próximamente.'
                    }
                  </p>
                  {(searchQuery || priceFilter !== 'all' || categoryFilter !== 'all') && (
                    <Button variant="outline-primary" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="ingenieria" title="Subservicios Ingeniería">
          {/* Buscador y Filtros para Ingeniería */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">
                <FiSearch className="me-2" />
                Buscar y Filtrar Subservicios de Ingeniería
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Buscar por código o descripción:</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FiSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Ej: ING01, diseño..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por precio:</Form.Label>
                    <Form.Select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <option value="all">Todos los precios</option>
                      <option value="fixed">Precio fijo</option>
                      <option value="evaluation">Sujeto a evaluación</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filtrar por categoría:</Form.Label>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="w-100"
                  >
                    <FiFilter className="me-1" />
                    Limpiar
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Lista de Subservicios de Ingeniería */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiList className="me-2" />
                Subservicios de Ingeniería
                <Badge bg="success" className="ms-2">
                  {filteredIngenieriaSubservices.length} de {totalIngenieria} subservicios
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {ingenieriaLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-2 text-muted">Cargando subservicios de Ingeniería...</p>
                </div>
              ) : filteredIngenieriaSubservices.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th width="15%">Código</th>
                        <th width="40%">Descripción</th>
                        <th width="20%">Sección</th>
                        <th width="15%">Precio</th>
                        <th width="10%">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIngenieriaSubservices.map((subservice) => (
                        <tr key={subservice.id}>
                          <td>
                            <Badge bg="success" className="fs-6">
                              <FiCode className="me-1" />
                              {subservice.codigo}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-bold text-dark mb-1">
                              {subservice.descripcion}
                            </div>
                            <small className="text-muted">
                              <FiFileText className="me-1" />
                              {formatNorma(subservice.norma)}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info" className="fs-6">
                              {getCategoryFromCode(subservice.codigo)}
                            </Badge>
                          </td>
                          <td>
                            <Badge 
                              bg={subservice.precio === 0 ? 'warning' : 'success'} 
                              className="fs-6"
                            >
                              <FiDollarSign className="me-1" />
                              {formatPrice(subservice.precio)}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              className="w-100"
                            >
                              Seleccionar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiList size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No hay subservicios de Ingeniería disponibles</h6>
                  <p className="text-muted small">
                    {searchQuery || priceFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'No se encontraron subservicios con los filtros aplicados.'
                      : 'Los subservicios de Ingeniería se cargarán próximamente.'
                    }
                  </p>
                  {(searchQuery || priceFilter !== 'all' || categoryFilter !== 'all') && (
                    <Button variant="outline-success" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

        </div>
  );
}