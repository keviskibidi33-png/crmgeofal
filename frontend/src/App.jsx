import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './layout/Layout';
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
                  <Route path="/" element={<Dashboard />} />
                  {/* Eliminada la duplicidad: solo / apunta a Dashboard */}
                  <Route path="/ajustes" element={<Ajustes />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/proyectos" element={<Proyectos />} />
                  <Route path="/cotizaciones" element={<Cotizaciones />} />
                  <Route path="/adjuntos" element={<Adjuntos />} />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/categorias" element={<Categorias />} />
                  <Route path="/subcategorias" element={<Subcategorias />} />
                  <Route path="/historial-proyectos" element={<HistorialProyectos />} />
                  <Route path="/notificaciones-whatsapp" element={<NotificacionesWhatsapp />} />
                  <Route path="/servicios" element={<Servicios />} />
                  <Route path="/subservicios" element={<Subservicios />} />
                  <Route path="/evidencias" element={<Evidencias />} />
                  <Route path="/facturas" element={<Facturas />} />
                  <Route path="/variantes-cotizacion" element={<VariantesCotizacion />} />
                  <Route path="/items-cotizacion" element={<ItemsCotizacion />} />
                  <Route path="/historial-tickets" element={<HistorialTickets />} />
                  <Route path="/auditoria" element={<Auditoria />} />
                  <Route path="/exportaciones" element={<Exportaciones />} />
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
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}

export default App;
