import React from 'react';

const ModuloBase = ({ titulo, descripcion, children }) => (
  <div className="py-4 px-3">
    <div className="fade-in">
      <div className="mb-4">
        <h2 className="mb-2">{titulo}</h2>
        <p className="text-muted mb-0">{descripcion}</p>
      </div>
      {children}
    </div>
  </div>
);

export default ModuloBase;
