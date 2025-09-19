import React from 'react';

const ModuloBase = ({ titulo, descripcion, children }) => (
  <div>
    <h2>{titulo}</h2>
    <p>{descripcion}</p>
    {children}
  </div>
);

export default ModuloBase;
