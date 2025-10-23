// Función para corregir caracteres UTF-8 mal codificados
export const fixUTF8 = (text) => {
  if (!text) return text;
  return text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã/g, 'Ó')
    .replace(/Ã/g, 'Ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã§/g, 'Ç')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¼/g, 'Ü')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã¨/g, 'È')
    .replace(/Ã¬/g, 'ì')
    .replace(/Ã¬/g, 'Ì')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã²/g, 'Ò')
    .replace(/Ã¹/g, 'ù')
    .replace(/Ã¹/g, 'Ù');
};

// Función de prueba
export const testUTF8Fix = () => {
  const testCases = [
    'Consolidacin unidimensional.',
    'Expansin libre.',
    'Expansin controlada Mtodo A.',
    'Compresin / Unidades de alba ilera de Arcilla.',
    'Medidas del rea de vacos en unidades perforadas.',
    'ndice de Durabilidad Agregado.',
    'Prctor modificado (*).',
    'Clasificacin suelo SUCS - AASHTO (*).'
  ];

  console.log('🧪 Probando corrección UTF-8:');
  testCases.forEach(test => {
    const fixed = fixUTF8(test);
    console.log(`Original: ${test}`);
    console.log(`Corregido: ${fixed}`);
    console.log('---');
  });
};
