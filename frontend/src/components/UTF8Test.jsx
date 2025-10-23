import React from 'react';
import { fixUTF8 } from '../utils/utf8Fix';

const UTF8Test = () => {
  const testCases = [
    'Consolidacin unidimensional.',
    'Expansin libre.',
    'Expansin controlada Mtodo A.',
    'Compresin / Unidades de alba ilera de Arcilla.',
    'Medidas del rea de vacos en unidades perforadas.',
    'ndice de Durabilidad Agregado.',
    'Prctor modificado (*).',
    'Clasificacin suelo SUCS - AASHTO (*).',
    'Absorcin / Unidades de albailera de Arcilla.',
    'Alabeo / Unidades de albailera de Arcilla.'
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Prueba de Corrección UTF-8</h2>
      <p>Caracteres de prueba: á é í ó ú ñ Á É Í Ó Ú Ñ</p>
      
      <h3>Casos de prueba:</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        {testCases.map((test, index) => (
          <div key={index} style={{ marginBottom: '10px', padding: '5px', border: '1px solid #eee' }}>
            <div><strong>Original:</strong> {test}</div>
            <div><strong>Corregido:</strong> {fixUTF8(test)}</div>
            <div style={{ color: test === fixUTF8(test) ? 'green' : 'red' }}>
              {test === fixUTF8(test) ? '✅ Sin cambios' : '🔧 Corregido'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UTF8Test;
