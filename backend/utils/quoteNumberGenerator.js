const pool = require('../config/db');

/**
 * Genera un número de cotización único con formato COT-YYMMDD-YY-NNN
 * Ejemplo: COT-131025-25-374
 * - COT: Prefijo fijo
 * - 131025: Fecha en formato YYMMDD (13 de octubre de 2025)
 * - 25: Año en formato YY (2025)
 * - 374: Número secuencial de 3 dígitos
 */
async function generateUniqueQuoteNumber() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const yearShort = String(year).slice(-2);
    
    // Formato: YYMMDD
    const datePart = `${yearShort}${month}${day}`;
    
    // Usar la función de secuencia para obtener el siguiente número
    const result = await pool.query('SELECT get_next_quote_sequence($1) as sequence', [datePart]);
    const nextSequence = result.rows[0].sequence;
    
    // Si llegamos a 999, reiniciar desde 1 (muy improbable en un día)
    const finalSequence = nextSequence > 999 ? 1 : nextSequence;
    
    const sequencePart = String(finalSequence).padStart(3, '0');
    const quoteNumber = `COT-${datePart}-${yearShort}-${sequencePart}`;
    
    console.log(`🔢 Generado número de cotización: ${quoteNumber}`);
    return quoteNumber;
    
  } catch (error) {
    console.error('❌ Error generando número de cotización:', error);
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-6);
    const fallbackNumber = `COT-${timestamp}-${String(new Date().getFullYear()).slice(-2)}-001`;
    console.log(`🔄 Usando número de fallback: ${fallbackNumber}`);
    return fallbackNumber;
  }
}

/**
 * Verifica si un número de cotización ya existe
 */
async function isQuoteNumberUnique(quoteNumber) {
  try {
    const result = await pool.query(
      'SELECT id FROM quotes WHERE quote_number = $1',
      [quoteNumber]
    );
    return result.rows.length === 0;
  } catch (error) {
    console.error('❌ Error verificando unicidad del número:', error);
    return false;
  }
}

/**
 * Genera un número de cotización único para clonación
 * Mantiene la fecha original pero con un nuevo número secuencial
 */
async function generateCloneQuoteNumber(originalQuoteNumber) {
  try {
    // Extraer fecha del número original
    const match = originalQuoteNumber.match(/COT-(\d{6})-(\d{2})-\d{3}/);
    if (!match) {
      // Si no coincide el formato, generar uno nuevo
      return await generateUniqueQuoteNumber();
    }
    
    const [, datePart, yearPart] = match;
    
    // Usar la función de secuencia para obtener el siguiente número
    const result = await pool.query('SELECT get_next_quote_sequence($1) as sequence', [datePart]);
    const nextSequence = result.rows[0].sequence;
    
    // Si llegamos a 999, reiniciar desde 1 (muy improbable en un día)
    const finalSequence = nextSequence > 999 ? 1 : nextSequence;
    
    const sequencePart = String(finalSequence).padStart(3, '0');
    const cloneQuoteNumber = `COT-${datePart}-${yearPart}-${sequencePart}`;
    
    console.log(`🔄 Generado número de cotización clonada: ${cloneQuoteNumber}`);
    return cloneQuoteNumber;
    
  } catch (error) {
    console.error('❌ Error generando número de cotización clonada:', error);
    return await generateUniqueQuoteNumber();
  }
}

module.exports = {
  generateUniqueQuoteNumber,
  isQuoteNumberUnique,
  generateCloneQuoteNumber
};
