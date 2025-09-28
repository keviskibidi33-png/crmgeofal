import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Card, 
  Badge, 
  InputGroup, 
  FormControl, 
  Button, 
  Spinner, 
  Alert,
  Row,
  Col,
  ListGroup
} from 'react-bootstrap';
import { FiSearch, FiPackage, FiDollarSign, FiFileText, FiCode } from 'react-icons/fi';
import { searchSubservices, listSubservices } from '../services/subservices';

const SubservicesList = ({ serviceId, area = 'laboratorio' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Obtener todos los subservicios del laboratorio
  const { data: allSubservices, isLoading, error } = useQuery(
    ['subservices', area],
    () => {
      console.log('🔍 Ejecutando query de subservicios:', { serviceId, area });
      // Si no hay serviceId, buscar por área
      return listSubservices({ area, limit: 50 });
    },
    { 
      keepPreviousData: true,
      retry: 3,
      retryDelay: 1000
    }
  );

  // Función de búsqueda inteligente
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSubservices(query, serviceId);
      setSearchResults(results.data || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Formatear precio
  const formatPrice = (price) => {
    if (price === 0) return 'Sujeto a evaluación';
    return `S/ ${price}`;
  };

  // Formatear norma
  const formatNorma = (norma) => {
    return norma === '-' || !norma ? 'Sin norma específica' : norma;
  };

  // Obtener categoría basada en el código
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

  // Datos de demostración
  const renderDemoData = () => {
    const demoSubservices = [
      { id: 1, codigo: 'SU04', descripcion: 'Contenido de humedad con Speedy.', norma: 'NTP 339.25', precio: 30 },
      { id: 2, codigo: 'SU20', descripcion: 'Contenido de humedad en suelos.', norma: 'ASTM D2216-19', precio: 30 },
      { id: 3, codigo: 'SU30', descripcion: 'Ensayo de Compactación Próctor Estándar.', norma: 'ASTM D698', precio: 150 },
      { id: 4, codigo: 'SU32', descripcion: 'Gravedad específica de los sólidos del suelo.', norma: 'ASTM D854-14', precio: 120 },
      { id: 5, codigo: 'C001.01', descripcion: 'Resistencia a la compresión de probetas cilíndricas de concreto.', norma: 'ASTM C39/C39M-24', precio: 90 },
      { id: 6, codigo: 'C003A', descripcion: 'Extracción, tallado, refrentado y ensayo de compresión de testigos diamantino de concreto.', norma: 'NTP 339.059', precio: 250 },
      { id: 7, codigo: 'AS06', descripcion: 'Película delgada (Incluye: pérdida por calentamiento, penetración del residuo, ductilidad del residuo)', norma: 'D1754', precio: 0 },
      { id: 8, codigo: 'AS25', descripcion: 'Control de calidad de emulsión catiónica modificada con polímeros.', norma: 'D2397', precio: 321 },
      { id: 9, codigo: 'PAV07', descripcion: 'Peso específico y peso unitario de mezcla asfálticas compactado.', norma: 'MTC E 514', precio: 90 },
      { id: 10, codigo: 'PAV08', descripcion: 'Determinación de la resistencia de mezclas bituminosas empleando el aparato Marshall.', norma: 'MTC E 504', precio: 540 },
      { id: 11, codigo: 'AG08A', descripcion: 'Inalterabilidad Agregado Grueso con Sulfato de Magnesio.', norma: 'ASTM C88', precio: 350 },
      { id: 12, codigo: 'ALB08', descripcion: 'Muestreo / Unidades de albañilería de concreto.', norma: 'ASTM C140', precio: 100 }
    ];

    return (
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
            {demoSubservices.map((subservice) => (
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
        
        {/* Estadísticas de demostración */}
        <div className="mt-4">
          <Card>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-primary mb-0">12</h5>
                    <small className="text-muted">Subservicios de Ejemplo</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-success mb-0">11</h5>
                    <small className="text-muted">Con Precio Fijo</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-warning mb-0">1</h5>
                    <small className="text-muted">Sujeto a Evaluación</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h5 className="text-info mb-0">6</h5>
                    <small className="text-muted">Categorías</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  };

  // Renderizar lista de subservicios
  const renderSubservicesList = (subservices) => {
    if (!subservices || subservices.length === 0) {
      return (
        <Alert variant="info" className="text-center">
          <FiPackage className="me-2" />
          No hay subservicios disponibles
        </Alert>
      );
    }

    return (
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
            {subservices.map((subservice) => (
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
    );
  };

  // Agrupar subservicios por categoría
  const groupSubservicesByCategory = (subservices) => {
    const groups = {};
    
    subservices.forEach(subservice => {
      let category = 'OTROS';
      
      if (subservice.codigo.startsWith('SU')) {
        category = 'ENSAYO ESTÁNDAR/ESPECIALES';
      } else if (subservice.codigo.startsWith('AG')) {
        category = 'ENSAYO AGREGADO';
      } else if (subservice.codigo.startsWith('C') || subservice.codigo.startsWith('CO')) {
        category = 'ENSAYO CONCRETO';
      } else if (subservice.codigo.startsWith('ALB')) {
        category = 'ENSAYO ALBAÑILERÍA';
      } else if (subservice.codigo.startsWith('R')) {
        category = 'ENSAYO ROCA';
      } else if (subservice.codigo.startsWith('CEM')) {
        category = 'CEMENTO';
      } else if (subservice.codigo.startsWith('PAV')) {
        category = 'ENSAYO PAVIMENTO';
      } else if (subservice.codigo.startsWith('AS')) {
        category = 'ENSAYO ASFALTO';
      } else if (subservice.codigo.startsWith('MA')) {
        category = 'ENSAYO MEZCLA ASFÁLTICO';
      } else if (subservice.codigo.startsWith('E')) {
        category = 'EVALUACIONES ESTRUCTURALES';
      } else if (subservice.codigo.startsWith('IMP')) {
        category = 'IMPLEMENTACIÓN LABORATORIO';
      } else if (subservice.codigo.startsWith('SER')) {
        category = 'OTROS SERVICIOS';
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(subservice);
    });
    
    return groups;
  };

  // Debug: Mostrar información de debugging
  console.log('SubservicesList Debug:', {
    serviceId,
    area,
    allSubservices,
    isLoading,
    error
  });

  const subservices = allSubservices?.data || [];
  const groupedSubservices = groupSubservicesByCategory(subservices);
  const categories = Object.keys(groupedSubservices);

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="subservices-list">
        <Alert variant="danger">
          <h6>Error cargando subservicios</h6>
          <p>{error.message}</p>
          <small>ServiceId: {serviceId}, Area: {area}</small>
        </Alert>
      </div>
    );
  }

  // Mostrar datos de ejemplo si hay error o si no hay datos
  if (error || !allSubservices || allSubservices.data?.length === 0) {
    return (
      <div className="subservices-list">
        <Alert variant="info">
          <h6>Modo de demostración</h6>
          <p>Mostrando subservicios de ejemplo del módulo de Laboratorio.</p>
          {error && <small>Error: {error.message}</small>}
        </Alert>
        {renderDemoData()}
      </div>
    );
  }

  return (
    <div className="subservices-list">
      {/* Barra de búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Buscar por código o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <InputGroup.Text>
                <Spinner animation="border" size="sm" />
              </InputGroup.Text>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Resultados de búsqueda */}
      {searchQuery && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              Resultados de búsqueda para "{searchQuery}"
              {searchResults.length > 0 && (
                <Badge bg="info" className="ms-2">
                  {searchResults.length} encontrados
                </Badge>
              )}
            </h6>
          </Card.Header>
          <Card.Body>
            {isSearching ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <div className="mt-2">Buscando...</div>
              </div>
            ) : (
              renderSubservicesList(searchResults)
            )}
          </Card.Body>
        </Card>
      )}

      {/* Lista completa por categorías */}
      {!searchQuery && (
        <div>
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Cargando subservicios...</div>
            </div>
          ) : (
            categories.map(category => (
              <Card key={category} className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0 text-primary">
                    <FiPackage className="me-2" />
                    {category}
                    <Badge bg="secondary" className="ms-2">
                      {groupedSubservices[category].length} subservicios
                    </Badge>
                  </h6>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="15%">Código</th>
                          <th width="40%">Descripción</th>
                          <th width="15%">Precio</th>
                          <th width="10%">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedSubservices[category].map((subservice) => (
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
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Estadísticas */}
      {!searchQuery && subservices.length > 0 && (
        <Card className="mt-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <h5 className="text-primary mb-0">{subservices.length}</h5>
                  <small className="text-muted">Total Subservicios</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h5 className="text-success mb-0">
                    {subservices.filter(s => s.precio > 0).length}
                  </h5>
                  <small className="text-muted">Con Precio Fijo</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h5 className="text-warning mb-0">
                    {subservices.filter(s => s.precio === 0).length}
                  </h5>
                  <small className="text-muted">Sujeto a Evaluación</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h5 className="text-info mb-0">{categories.length}</h5>
                  <small className="text-muted">Categorías</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SubservicesList;
