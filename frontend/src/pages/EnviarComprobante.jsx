import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { FiUpload, FiFileText, FiDollarSign, FiCalendar, FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EnviarComprobante = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // New state for filtered projects
  const [quotes, setQuotes] = useState([]); // New state for quotes
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estados para el buscador avanzado de cotizaciones
  const [quoteSearch, setQuoteSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [showQuoteFilters, setShowQuoteFilters] = useState(false);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [users, setUsers] = useState([]);

  // Formulario de envío
  const [formData, setFormData] = useState({
    quote_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    amount_paid: '',
    payment_date: '',
    payment_method: '',
    payment_proof: null,
    quote_file: null,
    project_id: '',
    description: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchQuotes();
    fetchUsers();
  }, []);

  // Aplicar filtros cuando cambien los parámetros
  useEffect(() => {
    applyQuoteFilters();
  }, [quotes, quoteSearch, dateFrom, dateTo, selectedUser]);

  const fetchProjects = async () => {
    try {
      console.log('🔍 fetchProjects - Llamando a /api/projects');
      console.log('🔍 fetchProjects - Usuario actual:', user);
      const projectsData = await api('/api/projects?limit=500');
      console.log('🔍 fetchProjects - Respuesta recibida:', projectsData);
      
      const projectsList = projectsData?.data || projectsData || [];
      console.log('🔍 fetchProjects - Lista de proyectos:', projectsList.length, 'proyectos');
      console.log('🔍 fetchProjects - Primeros 3 proyectos:', projectsList.slice(0, 3).map(p => ({ id: p.id, name: p.name, company_id: p.company_id })));
      
      setProjects(projectsList);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError('Error al cargar los proyectos: ' + (err.message || 'Error desconocido'));
      setProjects([]);
    }
  };

  const fetchQuotes = async () => {
    try {
      console.log('🔍 fetchQuotes - Llamando a /api/quotes/my-quotes');
      const quotesData = await api('/api/quotes/my-quotes');
      console.log('🔍 fetchQuotes - Respuesta recibida:', quotesData);
      
      const quotesList = quotesData?.data || quotesData || [];
      console.log('🔍 fetchQuotes - Lista de cotizaciones:', quotesList.length, 'cotizaciones');
      console.log('🔍 fetchQuotes - Primeras 3 cotizaciones:', quotesList.slice(0, 3).map(q => ({ id: q.id, quote_number: q.quote_number, client_name: q.client_name })));
      
      setQuotes(quotesList);
    } catch (err) {
      console.error('❌ Error fetching quotes:', err);
      setError('Error al cargar las cotizaciones: ' + (err.message || 'Error desconocido'));
      setQuotes([]);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 fetchUsers - Llamando a /api/users');
      const usersData = await api('/api/users?limit=100');
      console.log('🔍 fetchUsers - Respuesta recibida:', usersData);
      
      const usersList = usersData?.data || usersData || [];
      console.log('🔍 fetchUsers - Lista de usuarios:', usersList.length, 'usuarios');
      
      setUsers(usersList);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setUsers([]);
    }
  };

  // Función para aplicar filtros a las cotizaciones
  const applyQuoteFilters = () => {
    let filtered = [...quotes];

    // Filtro por texto de búsqueda
    if (quoteSearch.trim()) {
      const searchLower = quoteSearch.toLowerCase();
      filtered = filtered.filter(quote => {
        const clientName = (quote.client_name || quote.client_contact || '').toLowerCase();
        const quoteNumber = (quote.quote_number || '').toLowerCase();
        const total = (quote.total || quote.total_amount || 0).toString();
        
        return clientName.includes(searchLower) || 
               quoteNumber.includes(searchLower) || 
               total.includes(searchLower);
      });
    }

    // Filtro por rango de fechas
    if (dateFrom) {
      filtered = filtered.filter(quote => {
        const quoteDate = new Date(quote.created_at);
        const fromDate = new Date(dateFrom);
        return quoteDate >= fromDate;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(quote => {
        const quoteDate = new Date(quote.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Incluir todo el día
        return quoteDate <= toDate;
      });
    }

    // Filtro por usuario
    if (selectedUser) {
      filtered = filtered.filter(quote => {
        return quote.user_id == selectedUser || quote.created_by == selectedUser;
      });
    }

    console.log('🔍 applyQuoteFilters - Filtros aplicados:', {
      search: quoteSearch,
      dateFrom,
      dateTo,
      selectedUser,
      totalQuotes: quotes.length,
      filteredQuotes: filtered.length
    });

    setFilteredQuotes(filtered);
  };

  // Función para limpiar filtros
  const clearQuoteFilters = () => {
    setQuoteSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedUser('');
    setShowQuoteFilters(false);
  };

  // Función para establecer filtro de últimos días
  const setLastDaysFilter = (days) => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - days);
    
    setDateFrom(fromDate.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
    setShowQuoteFilters(true);
  };

  const fetchClients = async () => {
    try {
      console.log('🔍 fetchClients - Llamando a /api/companies');
      const clientsData = await api('/api/companies?limit=500');
      console.log('🔍 fetchClients - Respuesta recibida:', clientsData);
      
      const clientsList = clientsData?.data || clientsData || [];
      console.log('🔍 fetchClients - Lista de clientes:', clientsList.length, 'clientes');
      
      // Ordenar clientes por actividad reciente (más proyectos = más activos)
      const sortedClients = clientsList.sort((a, b) => {
        const aProjects = projects.filter(p => p.company_id === a.id).length;
        const bProjects = projects.filter(p => p.company_id === b.id).length;
        return bProjects - aProjects;
      });
      
      console.log('🔍 fetchClients - Clientes ordenados:', sortedClients.length);
      console.log('🔍 fetchClients - Primeros 3 clientes:', sortedClients.slice(0, 3).map(c => ({ id: c.id, name: c.name, ruc: c.ruc })));
      setClients(sortedClients);
      setFilteredClients(sortedClients);
    } catch (err) {
      console.error('❌ Error fetching clients:', err);
      setError('Error al cargar los clientes: ' + (err.message || 'Error desconocido'));
      setClients([]);
      setFilteredClients([]);
    }
  };

  const handleClientSearch = (searchTerm) => {
    console.log('🔍 handleClientSearch - Término de búsqueda:', searchTerm);
    console.log('🔍 handleClientSearch - Total de clientes:', clients.length);
    
    setClientSearch(searchTerm);
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
      setShowClientDropdown(false);
    } else {
      const searchLower = searchTerm.toLowerCase();
      console.log('🔍 handleClientSearch - Búsqueda en minúsculas:', searchLower);
      
      const filtered = clients.filter(client => {
        // Búsqueda por nombre completo
        const nameMatch = client.name.toLowerCase().includes(searchLower);
        
        // Búsqueda por palabras individuales del nombre
        const nameWords = client.name.toLowerCase().split(' ');
        const searchWords = searchLower.split(' ');
        const nameWordsMatch = searchWords.every(searchWord => 
          nameWords.some(nameWord => nameWord.includes(searchWord))
        );
        
        // Búsqueda por RUC
        const rucMatch = client.ruc?.toLowerCase().includes(searchLower);
        
        // Búsqueda por email
        const emailMatch = client.email?.toLowerCase().includes(searchLower);
        
        // Búsqueda por teléfono
        const phoneMatch = client.phone?.toLowerCase().includes(searchLower);
        
        const matches = nameMatch || nameWordsMatch || rucMatch || emailMatch || phoneMatch;
        
        if (matches) {
          console.log('✅ Cliente encontrado:', client.name, '- Match:', {
            nameMatch, nameWordsMatch, rucMatch, emailMatch, phoneMatch
          });
        }
        
        return matches;
      });
      
      console.log('🔍 handleClientSearch - Resultados encontrados:', filtered.length);
      setFilteredClients(filtered);
      setShowClientDropdown(true); // Mostrar dropdown cuando hay resultados
    }
  };

  const handleClientSelect = (client) => {
    console.log('🔍 handleClientSelect - Cliente seleccionado:', client.name, 'ID:', client.id);
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false); // Ocultar dropdown al seleccionar cliente
    setFormData({
      ...formData,
      client_name: client.name,
      client_email: client.email || '',
      client_phone: client.phone || '',
      client_address: client.address || ''
    });
    // Filtrar proyectos del cliente seleccionado
    console.log('🔍 handleClientSelect - Total de proyectos disponibles:', projects.length);
    console.log('🔍 handleClientSelect - ID del cliente:', client.id);
    console.log('🔍 handleClientSelect - Todos los proyectos con company_id:', projects.map(p => ({ id: p.id, name: p.name, company_id: p.company_id })));
    
    const clientProjects = projects.filter(project => project.company_id === client.id);
    console.log('🔍 handleClientSelect - Proyectos encontrados:', clientProjects.length);
    console.log('🔍 handleClientSelect - Proyectos del cliente:', clientProjects.map(p => ({ id: p.id, name: p.name, company_id: p.company_id })));
    setFilteredProjects(clientProjects);
  };

  const handleClientClear = () => {
    console.log('🔍 handleClientClear - Limpiando selección de cliente');
    setSelectedClient(null);
    setClientSearch('');
    setShowClientDropdown(false); // Ocultar dropdown al limpiar
    setFormData({
      ...formData,
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      project_id: ''
    });
    setFilteredProjects([]); // Clear filtered projects
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, payment_proof: file });
    }
  };

  const handleQuoteFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, quote_file: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.payment_proof) {
      setError('Debe subir un comprobante de pago');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('quote_id', formData.quote_id);
      formDataToSend.append('client_name', formData.client_name);
      formDataToSend.append('client_email', formData.client_email);
      formDataToSend.append('client_phone', formData.client_phone);
      formDataToSend.append('client_address', formData.client_address);
      formDataToSend.append('amount_paid', formData.amount_paid);
      formDataToSend.append('payment_date', formData.payment_date);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('project_id', formData.project_id);
      formDataToSend.append('payment_proof', formData.payment_proof);
      
      if (formData.quote_file) {
        formDataToSend.append('quote_file', formData.quote_file);
      }

      const response = await api('/api/payment-proofs/upload', {
        method: 'POST',
        body: formDataToSend
      });

      // Limpiar estados de manera segura
      setSuccess('Comprobante de pago enviado exitosamente');
      
      // Cerrar modal después de un pequeño delay para evitar warnings de React
      setTimeout(() => {
        setShowUploadModal(false);
        setFormData({
          quote_id: '',
          client_name: '',
          client_email: '',
          client_phone: '',
          client_address: '',
          amount_paid: '',
          payment_date: '',
          payment_method: '',
          payment_proof: null,
          quote_file: null,
          project_id: '',
          description: ''
        });
        
        // Limpiar estados de búsqueda
        setSelectedClient(null);
        setClientSearch('');
        setShowClientDropdown(false);
        setQuoteSearch('');
        setDateFrom('');
        setDateTo('');
        setSelectedUser('');
        setShowQuoteFilters(false);
      }, 100);
    } catch (err) {
      console.error('Error uploading proof:', err);
      setError('Error al enviar el comprobante: ' + (err.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>📤 Enviar Comprobante de Pago</h2>
          <p className="text-muted">Sube tu comprobante de pago y archivos relacionados para que facturación los revise y apruebe</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiUpload className="me-2" />
                Subir Comprobante de Pago
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <p className="text-muted mb-4">Sube tu comprobante de pago y archivos relacionados</p>
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => setShowUploadModal(true)}
                >
                  <FiUpload className="me-2" />
                  Subir Comprobante de Pago
                </Button>
                <p className="text-muted mt-3">
                  <small>Facturación revisará y aprobará tu comprobante</small>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de subida */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUpload className="me-2" />
            Subir Comprobante de Pago
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Paso 1: Selección de Cliente */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <FiUser className="me-2" />
                Paso 1: Seleccionar Cliente
              </h6>
              <Form.Group className="mb-3">
                <Form.Label>Buscar Cliente</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    value={clientSearch}
                    onChange={(e) => handleClientSearch(e.target.value)}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="Buscar por nombre, RUC, email o teléfono..."
                    className="pe-5"
                  />
                  {selectedClient && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="position-absolute end-0 top-50 translate-middle-y me-2"
                      onClick={handleClientClear}
                    >
                      ✕
                    </Button>
                  )}
                </div>
                {clientSearch && showClientDropdown && filteredClients.length > 0 && (
                  <div className="border rounded mt-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    <div className="p-2 bg-light border-bottom">
                      <small className="text-muted">
                        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-2 border-bottom cursor-pointer hover-bg-light"
                        onClick={() => handleClientSelect(client)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="fw-bold">{client.name}</div>
                        <small className="text-muted">
                          RUC: {client.ruc} | Email: {client.email}
                          {client.phone && ` | Tel: ${client.phone}`}
                        </small>
                        <div className="mt-1">
                          <small className="text-success">
                            📊 {projects.filter(p => p.company_id === client.id).length} proyecto{projects.filter(p => p.company_id === client.id).length !== 1 ? 's' : ''}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {clientSearch && showClientDropdown && filteredClients.length === 0 && (
                  <div className="border rounded mt-2 p-3 text-center">
                    <small className="text-muted">
                      No se encontraron clientes con "{clientSearch}"
                    </small>
                  </div>
                )}
                {selectedClient && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <strong>Cliente seleccionado:</strong> {selectedClient.name}
                    <br />
                    <small className="text-muted">
                      RUC: {selectedClient.ruc} | Email: {selectedClient.email}
                      {selectedClient.phone && ` | Tel: ${selectedClient.phone}`}
                    </small>
                    <div className="mt-1">
                      <small className="text-success">
                        📊 {projects.filter(p => p.company_id === selectedClient.id).length} proyecto{projects.filter(p => p.company_id === selectedClient.id).length !== 1 ? 's' : ''} disponible{projects.filter(p => p.company_id === selectedClient.id).length !== 1 ? 's' : ''}
                      </small>
                    </div>
                  </div>
                )}
              </Form.Group>
            </div>

            {/* Paso 2: Información del Cliente */}
            {selectedClient && (
              <div className="mb-4">
                <h6 className="text-primary mb-3">
                  <FiUser className="me-2" />
                  Paso 2: Información del Cliente
                </h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Cliente</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        placeholder="Nombre del cliente"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email del Cliente</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                        placeholder="email@cliente.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono del Cliente</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.client_phone}
                        onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                        placeholder="Teléfono del cliente"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección del Cliente</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.client_address}
                        onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                        placeholder="Dirección del cliente"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Paso 3: Información del Pago */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <FiDollarSign className="me-2" />
                Paso 3: Información del Pago
              </h6>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cotización Asociada</Form.Label>
                    
                    {/* Buscador de cotizaciones */}
                    <div className="mb-3">
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Buscar cotización por número, cliente o monto..."
                          value={quoteSearch}
                          onChange={(e) => setQuoteSearch(e.target.value)}
                          style={{flex: 1}}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowQuoteFilters(!showQuoteFilters)}
                          size="sm"
                        >
                          🔍 Filtros
                        </Button>
                        {(quoteSearch || dateFrom || dateTo || selectedUser) && (
                          <Button 
                            variant="outline-danger" 
                            onClick={clearQuoteFilters}
                            size="sm"
                          >
                            ✕ Limpiar
                          </Button>
                        )}
                      </div>

                      {/* Filtros avanzados */}
                      {showQuoteFilters && (
                        <Card className="mb-3">
                          <Card.Header className="py-2">
                            <small className="fw-bold">Filtros Avanzados</small>
                          </Card.Header>
                          <Card.Body className="py-2">
                            <Row>
                              <Col md={3}>
                                <Form.Label className="small">Fecha Desde</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={dateFrom}
                                  onChange={(e) => setDateFrom(e.target.value)}
                                  size="sm"
                                />
                              </Col>
                              <Col md={3}>
                                <Form.Label className="small">Fecha Hasta</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={dateTo}
                                  onChange={(e) => setDateTo(e.target.value)}
                                  size="sm"
                                />
                              </Col>
                              <Col md={3}>
                                <Form.Label className="small">Usuario</Form.Label>
                                <Form.Select
                                  value={selectedUser}
                                  onChange={(e) => setSelectedUser(e.target.value)}
                                  size="sm"
                                >
                                  <option value="">Todos los usuarios</option>
                                  {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                      {user.name} ({user.email})
                                    </option>
                                  ))}
                                </Form.Select>
                              </Col>
                              <Col md={3}>
                                <Form.Label className="small">Últimos días</Form.Label>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => setLastDaysFilter(7)}
                                    className="flex-fill"
                                  >
                                    7d
                                  </Button>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => setLastDaysFilter(30)}
                                    className="flex-fill"
                                  >
                                    30d
                                  </Button>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => setLastDaysFilter(90)}
                                    className="flex-fill"
                                  >
                                    90d
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      )}

                      {/* Dropdown de cotizaciones filtradas */}
                      <Form.Select
                        value={formData.quote_id}
                        onChange={(e) => setFormData({...formData, quote_id: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar cotización</option>
                        {Array.isArray(filteredQuotes) && filteredQuotes.map((quote) => (
                          <option key={quote.id} value={quote.id}>
                            {quote.quote_number || `COT-${quote.id}`} - {quote.client_name || quote.client_contact} - ${quote.total || quote.total_amount || 0}
                          </option>
                        ))}
                      </Form.Select>
                      
                      {/* Información de resultados */}
                      <div className="mt-2">
                        <small className="text-muted">
                          {filteredQuotes.length > 0 ? (
                            <>
                              📊 {filteredQuotes.length} cotización{filteredQuotes.length !== 1 ? 'es' : ''} encontrada{filteredQuotes.length !== 1 ? 's' : ''}
                              {quotes.length !== filteredQuotes.length && (
                                <span className="text-warning ms-2">
                                  (de {quotes.length} total)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-danger">
                              ❌ No se encontraron cotizaciones con los filtros aplicados
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                    
                    <Form.Text className="text-muted">
                      Selecciona la cotización relacionada con este comprobante de pago
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Monto Pagado</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Pago</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Método de Pago</Form.Label>
                    <Form.Select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar método</option>
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="cheque">Cheque</option>
                      <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                      <option value="otros">Otros</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Paso 4: Selección de Proyecto */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <FiFileText className="me-2" />
                Paso 4: Seleccionar Proyecto
              </h6>
              <Form.Group className="mb-3">
                <Form.Label>Proyecto Asociado</Form.Label>
                {!selectedClient ? (
                  <div className="alert alert-info">
                    <small>Primero selecciona un cliente para ver sus proyectos</small>
                  </div>
                ) : (
                  <Form.Select
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar proyecto de {selectedClient.name}</option>
                    {Array.isArray(filteredProjects) && filteredProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Text className="text-muted">
                  Proyecto al que pertenece esta cotización
                </Form.Text>
              </Form.Group>
            </div>

            {/* Paso 5: Archivos */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <FiUpload className="me-2" />
                Paso 5: Subir Archivos
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Archivo de Cotización (PDF/Excel)</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      onChange={handleQuoteFileUpload}
                    />
                    <Form.Text className="text-muted">
                      Archivo de la cotización enviada al cliente
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Comprobante de Pago (PDF/Imagen) *</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      required
                    />
                    <Form.Text className="text-muted">
                      Archivo del comprobante de pago (obligatorio)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Paso 6: Descripción */}
            <div className="mb-4">
              <h6 className="text-primary mb-3">
                <FiFileText className="me-2" />
                Paso 6: Información Adicional
              </h6>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Información adicional sobre el pago..."
                />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <FiUpload className="me-2" />
                Enviar Comprobante
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EnviarComprobante;