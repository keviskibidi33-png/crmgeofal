
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './layout/Layout';
import Login from './pages/Login';

// Placeholder para Home/Dashboard
const Home = () => <div>Bienvenido al CRMGeoFal</div>;

// Rutas protegidas por autenticación
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuthLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                {/* Aquí irán las rutas de módulos y dashboards */}
              </Routes>
            </RequireAuthLayout>
          } />
        </Routes>
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
