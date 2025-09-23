import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import RequireRole from './components/RequireRole';
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Ajustes = lazy(() => import('./pages/Ajustes'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Proyectos = lazy(() => import('./pages/Proyectos'));
const Cotizaciones = lazy(() => import('./pages/Cotizaciones'));
const Adjuntos = lazy(() => import('./pages/Adjuntos'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Reportes = lazy(() => import('./pages/Reportes'));
const Categorias = lazy(() => import('./pages/Categorias'));
const Subcategorias = lazy(() => import('./pages/Subcategorias'));
const HistorialProyectos = lazy(() => import('./pages/HistorialProyectos'));
const NotificacionesWhatsapp = lazy(() => import('./pages/NotificacionesWhatsapp'));
const Servicios = lazy(() => import('./pages/Servicios'));
const Subservicios = lazy(() => import('./pages/Subservicios'));
const Evidencias = lazy(() => import('./pages/Evidencias'));
const Facturas = lazy(() => import('./pages/Facturas'));
const VariantesCotizacion = lazy(() => import('./pages/VariantesCotizacion'));
const ItemsCotizacion = lazy(() => import('./pages/ItemsCotizacion'));
const HistorialTickets = lazy(() => import('./pages/HistorialTickets'));
const Auditoria = lazy(() => import('./pages/Auditoria'));
const Exportaciones = lazy(() => import('./pages/Exportaciones'));
const CotizacionNuevaLEM = lazy(() => import('./pages/CotizacionNuevaLEM'));
const FileManagement = lazy(() => import('./pages/FileManagement'));
const ListaCotizaciones = lazy(() => import('./pages/ListaCotizaciones'));
const DetalleCotizacion = lazy(() => import('./pages/DetalleCotizacion'));
const Activities = lazy(() => import('./pages/Activities'));

// Rutas protegidas por autenticación
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
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
                  {/* Eliminada la duplicidad: solo / apunta a Dashboard */}
                  <Route path="/ajustes" element={<ErrorBoundary><Ajustes /></ErrorBoundary>} />
                  <Route path="/usuarios" element={<ErrorBoundary><RequireRole roles={["admin"]}><Usuarios /></RequireRole></ErrorBoundary>} />
                  <Route path="/clientes" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><Clientes /></RequireRole></ErrorBoundary>} />
                  <Route path="/proyectos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><Proyectos /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><Cotizaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/lista" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><ListaCotizaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/nueva" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><CotizacionNuevaLEM /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/nueva/lem" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><CotizacionNuevaLEM /></RequireRole></ErrorBoundary>} />
                  <Route path="/cotizaciones/:id" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio","laboratorio","gerencia"]}><DetalleCotizacion /></RequireRole></ErrorBoundary>} />
                  <Route path="/adjuntos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","jefe_laboratorio","usuario_laboratorio"]}><Adjuntos /></RequireRole></ErrorBoundary>} />
                  <Route path="/tickets" element={<ErrorBoundary><RequireRole roles={["admin","soporte","jefa_comercial","vendedor_comercial"]}><Tickets /></RequireRole></ErrorBoundary>} />
                  <Route path="/reportes" element={<ErrorBoundary><RequireRole roles={["admin","gerencia","jefa_comercial"]}><Reportes /></RequireRole></ErrorBoundary>} />
                  <Route path="/categorias" element={<ErrorBoundary><RequireRole roles={["admin"]}><Categorias /></RequireRole></ErrorBoundary>} />
                  <Route path="/subcategorias" element={<ErrorBoundary><RequireRole roles={["admin"]}><Subcategorias /></RequireRole></ErrorBoundary>} />
                  <Route path="/historial-proyectos" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial","gerencia"]}><HistorialProyectos /></RequireRole></ErrorBoundary>} />
                  <Route path="/notificaciones-whatsapp" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial","vendedor_comercial"]}><NotificacionesWhatsapp /></RequireRole></ErrorBoundary>} />
                  <Route path="/servicios" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio"]}><Servicios /></RequireRole></ErrorBoundary>} />
                  <Route path="/subservicios" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio"]}><Subservicios /></RequireRole></ErrorBoundary>} />
                  <Route path="/evidencias" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><Evidencias /></RequireRole></ErrorBoundary>} />
                  <Route path="/facturas" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial"]}><Facturas /></RequireRole></ErrorBoundary>} />
                  <Route path="/variantes-cotizacion" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><VariantesCotizacion /></RequireRole></ErrorBoundary>} />
                  <Route path="/items-cotizacion" element={<ErrorBoundary><RequireRole roles={["admin","jefe_laboratorio","usuario_laboratorio","laboratorio"]}><ItemsCotizacion /></RequireRole></ErrorBoundary>} />
                  <Route path="/historial-tickets" element={<ErrorBoundary><RequireRole roles={["admin","soporte"]}><HistorialTickets /></RequireRole></ErrorBoundary>} />
                  <Route path="/auditoria" element={<ErrorBoundary><RequireRole roles={["admin"]}><Auditoria /></RequireRole></ErrorBoundary>} />
                  <Route path="/exportaciones" element={<ErrorBoundary><RequireRole roles={["admin","jefa_comercial"]}><Exportaciones /></RequireRole></ErrorBoundary>} />
                  <Route path="/actividades" element={<ErrorBoundary><RequireRole roles={["admin"]}><Activities /></RequireRole></ErrorBoundary>} />
                  <Route path="/gestion-archivos" element={<ErrorBoundary><RequireRole roles={["admin"]}><FileManagement /></RequireRole></ErrorBoundary>} />
                  {/* Fallback a dashboard si la ruta no existe */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RequireAuthLayout>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
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
