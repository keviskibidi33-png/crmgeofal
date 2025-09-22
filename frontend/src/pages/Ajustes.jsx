import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Row, Col, Card, Button, Form, Badge, Alert, Tab, Tabs, InputGroup } from 'react-bootstrap';
import { 
  FiUser, FiMail, FiShield, FiLogOut, FiSettings, FiBell, 
  FiLock, FiEye, FiEyeOff, FiSave, FiEdit, FiCheck, FiX,
  FiInfo, FiGlobe, FiDatabase, FiDownload
} from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';

const Ajustes = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    area: user?.area || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      jefa_comercial: 'warning',
      vendedor_comercial: 'primary',
      jefe_laboratorio: 'info',
      usuario_laboratorio: 'secondary',
      laboratorio: 'secondary',
      soporte: 'success',
      gerencia: 'dark'
    };
    return colors[role] || 'secondary';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      jefa_comercial: 'Jefa Comercial',
      vendedor_comercial: 'Vendedor',
      jefe_laboratorio: 'Jefe Laboratorio',
      usuario_laboratorio: 'Usuario Laboratorio',
      laboratorio: 'Laboratorio',
      soporte: 'Soporte',
      gerencia: 'Gerencia'
    };
    return labels[role] || role;
  };

  const handleProfileSave = () => {
    // Aquí iría la lógica para guardar los cambios del perfil
    setEditingProfile(false);
    // Simular guardado exitoso
    console.log('Perfil actualizado:', profileData);
  };

  const handlePasswordChange = () => {
    // Aquí iría la lógica para cambiar la contraseña
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    console.log('Contraseña actualizada');
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Configuración y Ajustes"
        subtitle="Gestiona tu perfil, configuración y preferencias del sistema"
        icon={FiSettings}
      />

      <Row className="g-4">
        <Col lg={4}>
          {/* Información del usuario */}
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex align-items-center justify-content-center">
                  <FiUser size={48} className="text-primary" />
                </div>
              </div>
              <h4 className="fw-bold">{user?.name}</h4>
              <p className="text-muted mb-2">{user?.email}</p>
              <Badge bg={getRoleBadgeColor(user?.role)} className="status-badge mb-3">
                {getRoleLabel(user?.role)}
              </Badge>
              {user?.area && (
                <div className="text-muted small">
                  <FiGlobe className="me-1" />
                  Área: {user.area}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Acciones rápidas */}
          <Card className="mt-4">
            <Card.Header>
              <h6 className="mb-0">Acciones Rápidas</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  <FiDownload className="me-2" />
                  Exportar Datos
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FiDatabase className="me-2" />
                  Historial de Actividad
                </Button>
                <Button variant="outline-danger" size="sm" onClick={logout}>
                  <FiLogOut className="me-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="profile" title="Perfil">
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5>Información Personal</h5>
                      <Button
                        variant={editingProfile ? "success" : "outline-primary"}
                        size="sm"
                        onClick={() => editingProfile ? handleProfileSave() : setEditingProfile(true)}
                      >
                        {editingProfile ? (
                          <>
                            <FiCheck className="me-1" />
                            Guardar
                          </>
                        ) : (
                          <>
                            <FiEdit className="me-1" />
                            Editar
                          </>
                        )}
                      </Button>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Nombre Completo</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Área</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.area}
                            onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {editingProfile && (
                      <div className="mt-3">
                        <Button variant="outline-secondary" size="sm" onClick={() => setEditingProfile(false)}>
                          <FiX className="me-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="security" title="Seguridad">
                  <div className="p-3">
                    <h5 className="mb-4">Cambiar Contraseña</h5>
                    
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Contraseña Actual</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Nueva Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Confirmar Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="mt-3">
                      <Button variant="primary" onClick={handlePasswordChange}>
                        <FiLock className="me-1" />
                        Cambiar Contraseña
                      </Button>
                    </div>

                    <Alert variant="info" className="mt-4">
                      <FiInfo className="me-2" />
                      <strong>Recomendaciones de seguridad:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Usa al menos 8 caracteres</li>
                        <li>Incluye mayúsculas, minúsculas y números</li>
                        <li>Evita información personal</li>
                      </ul>
                    </Alert>
                  </div>
                </Tab>

                <Tab eventKey="notifications" title="Notificaciones">
                  <div className="p-3">
                    <h5 className="mb-4">Preferencias de Notificaciones</h5>
                    
                    <div className="space-y-3">
                      <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                        <div>
                          <div className="fw-medium">
                            <FiMail className="me-2" />
                            Notificaciones por Email
                          </div>
                          <small className="text-muted">Recibe notificaciones importantes por correo electrónico</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                        <div>
                          <div className="fw-medium">
                            <FiBell className="me-2" />
                            Notificaciones Push
                          </div>
                          <small className="text-muted">Recibe notificaciones en tiempo real en el navegador</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={notifications.push}
                          onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                        <div>
                          <div className="fw-medium">
                            <FiBell className="me-2" />
                            Notificaciones SMS
                          </div>
                          <small className="text-muted">Recibe notificaciones críticas por mensaje de texto</small>
                        </div>
                        <Form.Check
                          type="switch"
                          checked={notifications.sms}
                          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="primary">
                        <FiSave className="me-1" />
                        Guardar Preferencias
                      </Button>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="system" title="Sistema">
                  <div className="p-3">
                    <h5 className="mb-4">Información del Sistema</h5>
                    
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="p-3 border rounded">
                          <h6>Versión del Sistema</h6>
                          <p className="text-muted mb-0">CRM GeoFal v1.0.0</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 border rounded">
                          <h6>Última Actualización</h6>
                          <p className="text-muted mb-0">15 de Enero, 2025</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 border rounded">
                          <h6>Base de Datos</h6>
                          <p className="text-muted mb-0">PostgreSQL 14.0</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 border rounded">
                          <h6>Servidor</h6>
                          <p className="text-muted mb-0">Node.js 18.0</p>
                        </div>
                      </Col>
                    </Row>

                    <Alert variant="info" className="mt-4">
                      <FiInfo className="me-2" />
                      Para más información sobre el sistema, contacta al administrador.
                    </Alert>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Ajustes;
