/**
 * Utilidades para manejar dependencias entre ensayos
 */

/**
 * Extrae códigos de ensayos dependientes de un comentario
 * @param {string} comentario - El comentario del ensayo
 * @returns {Array<string>} - Array de códigos de ensayos dependientes
 */
export function extractDependenciesFromComment(comentario) {
  if (!comentario || typeof comentario !== 'string') {
    return [];
  }

  const dependencies = [];
  
  // Patrón más específico para encontrar códigos de ensayos
  // Busca códigos como SU24, AG19, AG28, SU32, SU31, etc.
  const pattern = /\b([A-Z]{2}\d{2,3})\b/g;
  
  let match;
  while ((match = pattern.exec(comentario)) !== null) {
    const code = match[1];
    if (code && !dependencies.includes(code)) {
      dependencies.push(code);
    }
  }

  return dependencies;
}

/**
 * Mapea códigos de ensayos a sus nombres/descripciones
 * @param {Array<string>} codigos - Array de códigos
 * @param {Array} ensayosData - Array de datos de ensayos
 * @returns {Array<Object>} - Array de objetos con código y descripción
 */
export function mapCodesToEnsayos(codigos, ensayosData) {
  return codigos.map(codigo => {
    const ensayo = ensayosData.find(e => e.codigo === codigo);
    return {
      codigo,
      descripcion: ensayo?.descripcion || `Ensayo ${codigo}`,
      precio: ensayo?.precio || 0,
      norma: ensayo?.norma || '',
      ubicacion: ensayo?.ubicacion || 'LABORATORIO'
    };
  });
}

/**
 * Analiza un ensayo y extrae sus dependencias
 * @param {Object} ensayo - Objeto del ensayo
 * @param {Array} ensayosData - Array completo de ensayos
 * @returns {Object} - Objeto con el ensayo y sus dependencias
 */
export function analyzeEnsayoDependencies(ensayo, ensayosData) {
  const dependencies = extractDependenciesFromComment(ensayo.comentarios);
  const mappedDependencies = mapCodesToEnsayos(dependencies, ensayosData);
  
  return {
    ensayo,
    dependencies: mappedDependencies,
    hasDependencies: mappedDependencies.length > 0
  };
}

/**
 * Formatea las dependencias para mostrar en la UI
 * @param {Array} dependencies - Array de dependencias
 * @returns {string} - Texto formateado para mostrar
 */
export function formatDependenciesForDisplay(dependencies) {
  if (!dependencies || dependencies.length === 0) {
    return '';
  }

  if (dependencies.length === 1) {
    return `Requiere: ${dependencies[0].codigo}`;
  }

  if (dependencies.length <= 3) {
    const codes = dependencies.map(d => d.codigo).join(', ');
    return `Requiere: ${codes}`;
  }

  const firstThree = dependencies.slice(0, 3).map(d => d.codigo).join(', ');
  const remaining = dependencies.length - 3;
  return `Requiere: ${firstThree} y ${remaining} más`;
}

/**
 * Verifica si un ensayo tiene dependencias específicas
 * @param {string} codigo - Código del ensayo
 * @param {Array} ensayosData - Array completo de ensayos
 * @returns {boolean} - True si tiene dependencias
 */
export function hasDependencies(codigo, ensayosData) {
  const ensayo = ensayosData.find(e => e.codigo === codigo);
  if (!ensayo) return false;
  
  const dependencies = extractDependenciesFromComment(ensayo.comentarios);
  return dependencies.length > 0;
}
