import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import RequireRole from './components/RequireRole';

// ===== IMPORTS LAZY LOADING =====
// Autenticación
const Login = lazy(() => import('./pages/Login'));

// Dashboard
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

// Gestión principal
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Proyectos = lazy(() => import('./pages/Proyectos'));
const HistorialProyectos = lazy(() => import('./pages/HistorialProyectos'));

// Cotizaciones
const Cotizaciones = lazy(() => import('./pages/Cotizaciones'));
const CotizacionNuevaLEM = lazy(() => import('./pages/CotizacionNuevaLEM'));
const CotizacionInteligente = lazy(() => import('./pages/CotizacionInteligente'));
const ListaCotizaciones = lazy(() => import('./pages/ListaCotizaciones'));
const DetalleCotizacion = lazy(() => import('./pages/DetalleCotizacion'));

// Servicios y laboratorio
const Servicios = lazy(() => import('./pages/Servicios'));
const Laboratorio = lazy(() => import('./pages/Laboratorio'));
const Evidencias = lazy(() => import('./pages/Evidencias'));

// Tickets y soporte
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketsVendedor = lazy(() => import('./pages/TicketsVendedor'));
const HistorialTickets = lazy(() => import('./pages/HistorialTickets'));

// Reportes y auditoría
const Reportes = lazy(() => import('./pages/Reportes'));
const Auditoria = lazy(() => import('./pages/Auditoria'));
const Exportaciones = lazy(() => import('./pages/Exportaciones'));

// Archivos y gestión
const Adjuntos = lazy(() => import('./pages/Adjuntos'));
const FileManagement = lazy(() => import('./pages/FileManagement'));
const Facturas = lazy(() => import('./pages/Facturas'));

// Configuración
const Ajustes = lazy(() => import('./pages/Ajustes'));

// Sistema unificado de comprobantes de pago
const MetricasEmbudo = lazy(() => import('./pages/MetricasEmbudo'));
const ComprobantesPago = lazy(() => import('./pages/ComprobantesPago'));
const EnviarComprobante = lazy(() => import('./pages/EnviarComprobante'));
const DashboardAsesor = lazy(() => import('./pages/DashboardAsesor'));
const MisCotizaciones = lazy(() => import('./pages/MisCotizaciones'));

// Dashboards específicos por rol
const JefaComercialDashboard = lazy(() => import('./pages/dashboards/JefaComercialDashboard'));
const VendedorComercialDashboard = lazy(() => import('./pages/dashboards/VendedorComercialDashboard'));
const LaboratorioDashboard = lazy(() => import('./pages/dashboards/LaboratorioDashboard'));
const FacturacionDashboard = lazy(() => import('./pages/dashboards/FacturacionDashboard'));
const SoporteDashboard = lazy(() => import('./pages/dashboards/SoporteDashboard'));
const GerenciaDashboard = lazy(() => import('./pages/dashboards/GerenciaDashboard'));

// Nuevos módulos implementados
const PlantillasCliente = lazy(() => import('./pages/PlantillasCliente'));
const SeguimientoEnvios = lazy(() => import('./pages/SeguimientoEnvios'));
const ProyectosLaboratorio = lazy(() => import('./pages/ProyectosLaboratorio'));
const FacturacionProyectos = lazy(() => import('./pages/FacturacionProyectos'));

// Notificaciones
const Notificaciones = lazy(() => import('./pages/Notificaciones'));

// Rutas protegidas por autenticación
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <RequireAuthLayout>
                  <Routes>
                  <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  
                  {/* Dashboards específicos por rol */}
                  <Route path="/dashboards/jefa-comercial" element={<ErrorBoundary><RequireRole roles={["jefa_comercial"]}><JefaComercialDashboard /></RequireRole></ErrorBoundary>} />
                  <Route path="/dashboards/vendedor-comercial" element={<ErrorBoundary><RequireRole roles={["vendedor_comercial"]}><VendedorComercialDashboard /></RequireRole></ErrorBoundary>} />
                  <Route path="/dashboards/laboratorio" element={<ErrorBoundary><RequireRole roles={["jefe_laboratorio","usuario_laboratorio"]}><LaboratorioDashboard /></RequireRole></ErrorBoundary>} />
                  <Route path="/dashboards/facturacion" element={<ErrorBoundary><RequireRole roles={["facturacion"]}><FacturacionDashboard /></RequireRole></ErrorBoundary>} />
                  <Route path="/dashboards/soporte" element={<ErrorBoundary><RequireRole roles={["soporte"]}><SoporteDashboard /></RequireRole></ErrorBoundary>} />
                  <Route path="/dashboards/gerencia" element={<ErrorBoundary><RequireRole roles={["gerencia","admin"]}><GerenciaDashboard /></RequireRole></ErrorBoundary>} />
                  
                  <Route path="/dashboard-asesor" element={<ErrorBoundary><RequireRole roles={["vendedor_comercial"]}><DashboardAsesor /></RequireRole></ErrorBoundary>} />
                  {/* Eliminada la duplicidad: solo / apunta a Dashboard */}
                  <Route path="/ajustes" element={<ErrorBoundary><Ajustes /></ErrorBoundary>} />
                  <Route path="/usuarios" element={<ErrorBoundary><RequireRole roles={["admin"]}><Usuarios /></RequireRole></ErrorBoundary>} />
                  <Route path="/clientes" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><Clientes /></RequireRole></ErrorBoundary>} />
                  <Route path="/proyectos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><Proyectos /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><Cotizaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/lista" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><ListaCotizaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/nueva" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><CotizacionNuevaLEM /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/inteligente" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><CotizacionInteligente /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/nueva/lem" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio"]}><CotizacionNuevaLEM /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/:id" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio","gerencia"]}><DetalleCotizacion /></RequireRole></ErrorBoundary>} />
                  <Route path="/adjuntos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><Adjuntos /></RequireRole></ErrorBoundary>} />
                  <Route path="/tickets" element={<ErrorBoundary><RequireRole roles={["admin","soporte","jefa_comercial","vendedor_comercial"]}><Tickets /></RequireRole></ErrorBoundary>} />
                  <Route path="/tickets-vendedor" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial"]}><TicketsVendedor /></RequireRole></ErrorBoundary>} />
                  <Route path="/reportes" element={<ErrorBoundary><RequireRole roles={["admin","gerencia","jefa_comercial"]}><Reportes /></RequireRole></ErrorBoundary>} />
                  {/* <Route path="/categorias" element={<ErrorBoundary><RequireRole roles={["admin"]}><Categorias /></RequireRole></ErrorBoundary>} /> */}
                  {/* <Route path="/subcategorias" element={<ErrorBoundary><RequireRole roles={["admin"]}><Subcategorias /></RequireRole></ErrorBoundary>} /> */}
                  <Route path="/historial-proyectos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><HistorialProyectos /></RequireRole></ErrorBoundary>} />
                  <Route path="/servicios" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio"]}><Servicios /></RequireRole></ErrorBoundary>} />
                  <Route path="/laboratorio" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio"]}><Laboratorio /></RequireRole></ErrorBoundary>} />
                  <Route path="/evidencias" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio"]}><Evidencias /></RequireRole></ErrorBoundary>} />
                  <Route path="/facturas" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial"]}><Facturas /></RequireRole></ErrorBoundary>} />
                  {/* Rutas eliminadas: /variantes-cotizacion, /items-cotizacion */}
                  <Route path="/historial-tickets" element={<ErrorBoundary><RequireRole roles={["admin","soporte"]}><HistorialTickets /></RequireRole></ErrorBoundary>} />
                  <Route path="/auditoria" element={<ErrorBoundary><RequireRole roles={["admin"]}><Auditoria /></RequireRole></ErrorBoundary>} />
                  <Route path="/exportaciones" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial"]}><Exportaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/actividades" element={<Navigate to="/auditoria" replace />} />
                  <Route path="/gestion-archivos" element={<ErrorBoundary><RequireRole roles={["admin"]}><FileManagement /></RequireRole></ErrorBoundary>} />
                  
                         {/* Sistema de comprobantes de pago */}
                         <Route path="/enviar-comprobante" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial"]}><EnviarComprobante /></RequireRole></ErrorBoundary>} />
                         <Route path="/comprobantes-pago" element={<ErrorBoundary><RequireRole roles={["admin","facturacion"]}><ComprobantesPago /></RequireRole></ErrorBoundary>} />
                         <Route path="/metricas-embudo" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial"]}><MetricasEmbudo /></RequireRole></ErrorBoundary>} />
                         <Route path="/facturacion-dashboard" element={<ErrorBoundary><RequireRole roles={["admin","facturacion"]}><FacturacionDashboard /></RequireRole></ErrorBoundary>} />
                         
                         {/* Mis Cotizaciones - Vendedores autónomos */}
                         <Route path="/mis-cotizaciones" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial"]}><MisCotizaciones /></RequireRole></ErrorBoundary>} />
                         
                         {/* Nuevos módulos implementados */}
                         <Route path="/plantillas-cliente" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial"]}><PlantillasCliente /></RequireRole></ErrorBoundary>} />
                         <Route path="/seguimiento-envios" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><SeguimientoEnvios /></RequireRole></ErrorBoundary>} />
                         <Route path="/proyectos-laboratorio" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio"]}><ProyectosLaboratorio /></RequireRole></ErrorBoundary>} />
                         <Route path="/facturacion-proyectos" element={<ErrorBoundary><RequireRole roles={["admin","facturacion"]}><FacturacionProyectos /></RequireRole></ErrorBoundary>} />
                         
                         {/* Notificaciones */}
                         <Route path="/notificaciones" element={<ErrorBoundary><Notificaciones /></ErrorBoundary>} />
                  
                  {/* Fallback a dashboard si la ruta no existe */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RequireAuthLayout>
            } />
          </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </SocketProvider>
  );
}

// Layout solo visible si autenticado
function RequireAuthLayout({ children }) {
  const { user, loading } = useAuth();
  // Mientras verificamos la sesión, mostramos loader
  if (loading) {
    return <div style={{ padding: 24 }}>Verificando sesión...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default App;
