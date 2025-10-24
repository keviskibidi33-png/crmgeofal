import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Alert, Spinner, Dropdown } from 'react-bootstrap';
import { 
  FiSearch, FiFilter, FiDownload, FiUpload, FiEdit, FiEye, 
  FiDollarSign, FiRefreshCw, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { apiFetch } from '../services/api';

const EnsayosList = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    ubicacion: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [selectedEnsayos, setSelectedEnsayos] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false);
  const [priceUpdates, setPriceUpdates] = useState([]);

  // Categorías disponibles
  const categorias = [
    'ENSAYO ESTÁNDAR SUELO',
    'ENSAYOS ESPECIALES SUELO',
    'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO',
    'ENSAYOS DE CAMPO EN SUELO',
    'ENSAYO AGREGADO',
    'ENSAYO QUÍMICO AGREGADO',
    'ENSAYO CONCRETO',
    'ENSAYO ALBAÑILERÍA',
    'ENSAYO ROCA',
    'CEMENTO',
    'ENSAYO PAVIMENTO',
    'ENSAYO MEZCLA ASFÁLTICA',
    'EVALUACIONES ESTRUCTURALES',
    'OTROS SERVICIOS'
  ];

  const ubicaciones = ['LABORATORIO', 'CAMPO'];


  // Cargar ensayos
  const loadEnsayos = async () => {
    console.log('🔄 Iniciando carga de ensayos...');
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.categoria && { categoria: filters.categoria }),
        ...(filters.ubicacion && { ubicacion: filters.ubicacion })
      });

      console.log('📡 Parámetros:', params.toString());
      console.log('🌐 Llamando a API:', `/ensayos?${params}`);
      
      const data = await apiFetch(`/ensayos/temp?${params}`);
      console.log('✅ Respuesta de API:', data);
      
      setEnsayos(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (error) {
      console.error('❌ Error cargando ensayos:', error);
      setEnsayos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect ejecutado - Cargando ensayos');
    loadEnsayos();
  }, [pagination.page, searchTerm, filters]);

  // Buscar ensayos
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Aplicar filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Seleccionar ensayos
  const handleSelectEnsayos = (ensayo, checked) => {
    if (checked) {
      setSelectedEnsayos(prev => [...prev, ensayo]);
    } else {
      setSelectedEnsayos(prev => prev.filter(e => e.codigo !== ensayo.codigo));
    }
  };

  // Seleccionar todos
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEnsayos(ensayos);
    } else {
      setSelectedEnsayos([]);
    }
  };

  // Actualizar precios masivos
  const handleBulkPriceUpdate = () => {
    if (selectedEnsayos.length === 0) {
      alert('Selecciona al menos un ensayo');
      return;
    }
    setPriceUpdates(selectedEnsayos.map(e => ({ codigo: e.codigo, precio: e.precio })));
    setShowPriceUpdateModal(true);
  };

  // Guardar actualizaciones de precios
  const handleSavePriceUpdates = async () => {
    try {
      await apiFetch('/ensayos/precios/masivos', {
        method: 'PUT',
        body: JSON.stringify({ actualizaciones: priceUpdates })
      });
      
      alert('Precios actualizados exitosamente');
      setShowPriceUpdateModal(false);
      setPriceUpdates([]);
      loadEnsayos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error actualizando precios');
    }
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  // Obtener color por categoría
  const getCategoryColor = (categoria) => {
    const colors = {
      'ENSAYO ESTÁNDAR SUELO': 'primary',
      'ENSAYOS ESPECIALES SUELO': 'warning',
      'ENSAYO QUÍMICO SUELO Y AGUA SUBTERRÁNEO': 'info',
      'ENSAYOS DE CAMPO EN SUELO': 'success',
      'ENSAYO AGREGADO': 'secondary',
      'ENSAYO QUÍMICO AGREGADO': 'dark',
      'ENSAYO CONCRETO': 'danger',
      'ENSAYO ALBAÑILERÍA': 'light',
      'ENSAYO ROCA': 'primary',
      'CEMENTO': 'warning',
      'ENSAYO PAVIMENTO': 'info',
      'ENSAYO MEZCLA ASFÁLTICA': 'success',
      'EVALUACIONES ESTRUCTURALES': 'secondary',
      'OTROS SERVICIOS': 'dark'
    };
    return colors[categoria] || 'light';
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Lista de Precios - Ensayos</h2>
              <p className="text-muted mb-0">Gestiona los ensayos y sus precios</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm">
                <FiDownload className="me-1" />
                Exportar
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => setShowImportModal(true)}>
                <FiUpload className="me-1" />
                Importar
              </Button>
              <Button variant="primary" size="sm" onClick={loadEnsayos}>
                <FiRefreshCw className="me-1" />
                Actualizar
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Buscar</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FiSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Ubicación</Form.Label>
            <Form.Select
              value={filters.ubicacion}
              onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
            >
              <option value="">Todas las ubicaciones</option>
              {ubicaciones.map(ubic => (
                <option key={ubic} value={ubic}>{ubic}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>&nbsp;</Form.Label>
            <div className="d-flex gap-2">
              {selectedEnsayos.length > 0 && (
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={handleBulkPriceUpdate}
                >
                  <FiDollarSign className="me-1" />
                  Actualizar Precios ({selectedEnsayos.length})
                </Button>
              )}
            </div>
          </Form.Group>
        </Col>
      </Row>

      {/* Tabla de ensayos */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              <FiEye className="me-1 text-primary" />
              Lista de Ensayos
            </h6>
            <Badge bg="light" text="dark" className="px-2 py-1">
              {pagination.total} ensayos
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedEnsayos.length === ensayos.length && ensayos.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Norma</th>
                  <th>Ubicación</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando ensayos...
                    </td>
                  </tr>
                ) : ensayos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No se encontraron ensayos
                    </td>
                  </tr>
                ) : (
                  ensayos.map((ensayo) => (
                    <tr key={ensayo.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedEnsayos.some(e => e.codigo === ensayo.codigo)}
                          onChange={(e) => handleSelectEnsayos(ensayo, e.target.checked)}
                        />
                      </td>
                      <td>
                        <Badge bg="primary" className="font-monospace">
                          {ensayo.codigo}
                        </Badge>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="fw-medium">{ensayo.descripcion}</div>
                          {ensayo.comentarios && (
                            <small className="text-muted d-block mt-1">
                              {ensayo.comentarios.substring(0, 80)}...
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="fw-medium">{ensayo.norma}</div>
                          {ensayo.referencia_otra_norma && (
                            <small className="text-muted d-block">
                              {ensayo.referencia_otra_norma}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={ensayo.ubicacion === 'LABORATORIO' ? 'info' : 'success'}>
                          {ensayo.ubicacion}
                        </Badge>
                      </td>
                      <td>
                        <div className="fw-bold text-success">
                          {formatPrice(ensayo.precio)}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getCategoryColor(ensayo.categoria)} text={getCategoryColor(ensayo.categoria) === 'light' ? 'dark' : undefined}>
                          {ensayo.categoria}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm">
                            <FiEye />
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            <FiEdit />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-center">
              <div className="btn-group">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
                <Button variant="outline-secondary" size="sm" disabled>
                  Página {pagination.page} de {pagination.pages}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Modal de actualización de precios */}
      {showPriceUpdateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Actualizar Precios</h5>
                <Button variant="close" onClick={() => setShowPriceUpdateModal(false)} />
              </div>
              <div className="modal-body">
                <p>Actualizando precios para {priceUpdates.length} ensayos...</p>
                {priceUpdates.map((update, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{update.codigo}</span>
                    <Form.Control
                      type="number"
                      value={update.precio}
                      onChange={(e) => {
                        const newUpdates = [...priceUpdates];
                        newUpdates[index].precio = parseFloat(e.target.value);
                        setPriceUpdates(newUpdates);
                      }}
                      style={{ width: '120px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowPriceUpdateModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSavePriceUpdates}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default EnsayosList;