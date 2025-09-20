import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
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
const ListaCotizaciones = lazy(() => import('./pages/ListaCotizaciones'));
const DetalleCotizacion = lazy(() => import('./pages/DetalleCotizacion'));

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
                  <Route path="/usuarios" element={<ErrorBoundary><Usuarios /></ErrorBoundary>} />
                  <Route path="/clientes" element={<ErrorBoundary><Clientes /></ErrorBoundary>} />
                  <Route path="/proyectos" element={<ErrorBoundary><Proyectos /></ErrorBoundary>} />
                  <Route path="/cotizaciones" element={<ErrorBoundary><Cotizaciones /></ErrorBoundary>} />
                  <Route path="/cotizaciones/lista" element={<ErrorBoundary><ListaCotizaciones /></ErrorBoundary>} />
                  <Route path="/cotizaciones/nueva/lem" element={<ErrorBoundary><CotizacionNuevaLEM /></ErrorBoundary>} />
                  <Route path="/cotizaciones/:id" element={<ErrorBoundary><DetalleCotizacion /></ErrorBoundary>} />
                  <Route path="/adjuntos" element={<ErrorBoundary><Adjuntos /></ErrorBoundary>} />
                  <Route path="/tickets" element={<ErrorBoundary><Tickets /></ErrorBoundary>} />
                  <Route path="/reportes" element={<ErrorBoundary><Reportes /></ErrorBoundary>} />
                  <Route path="/categorias" element={<ErrorBoundary><Categorias /></ErrorBoundary>} />
                  <Route path="/subcategorias" element={<ErrorBoundary><Subcategorias /></ErrorBoundary>} />
                  <Route path="/historial-proyectos" element={<ErrorBoundary><HistorialProyectos /></ErrorBoundary>} />
                  <Route path="/notificaciones-whatsapp" element={<ErrorBoundary><NotificacionesWhatsapp /></ErrorBoundary>} />
                  <Route path="/servicios" element={<ErrorBoundary><Servicios /></ErrorBoundary>} />
                  <Route path="/subservicios" element={<ErrorBoundary><Subservicios /></ErrorBoundary>} />
                  <Route path="/evidencias" element={<ErrorBoundary><Evidencias /></ErrorBoundary>} />
                  <Route path="/facturas" element={<ErrorBoundary><Facturas /></ErrorBoundary>} />
                  <Route path="/variantes-cotizacion" element={<ErrorBoundary><VariantesCotizacion /></ErrorBoundary>} />
                  <Route path="/items-cotizacion" element={<ErrorBoundary><ItemsCotizacion /></ErrorBoundary>} />
                  <Route path="/historial-tickets" element={<ErrorBoundary><HistorialTickets /></ErrorBoundary>} />
                  <Route path="/auditoria" element={<ErrorBoundary><Auditoria /></ErrorBoundary>} />
                  <Route path="/exportaciones" element={<ErrorBoundary><Exportaciones /></ErrorBoundary>} />
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
