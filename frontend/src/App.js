import React from 'react';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>CRM Frontend</h1>
        {/* Aquí irán las rutas y componentes principales */}
      </div>
    </AuthProvider>
  );
}

export default App;
