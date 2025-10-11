// Helpers para la plantilla de cotización
// Este código va en la pestaña 'scripts' de jsreport

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return dateString; // Retornar el string original si no es una fecha válida
        }
        
        // Agregamos un día porque JS a veces interpreta la fecha en UTC y puede restar un día
        date.setDate(date.getDate() + 1);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return dateString;
    }
}

/**
 * Formatea un número como moneda peruana
 * @param {number|string} number - Número a formatear
 * @returns {string} - Número formateado con separadores de miles
 */
function formatCurrency(number) {
    try {
        const num = parseFloat(number);
        if (isNaN(num)) return "0.00";
        
        // Formatear con 2 decimales y separadores de miles
        return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    } catch (error) {
        console.error('Error formateando moneda:', error);
        return "0.00";
    }
}

/**
 * Calcula los totales de la cotización
 * @param {Array} items - Array de ítems de la cotización
 * @param {string} type - Tipo de cálculo: 'subtotal', 'igv', 'total'
 * @returns {string} - Total formateado como moneda
 */
function calculateTotals(items, type) {
    try {
        if (!items || !Array.isArray(items)) {
            return '0.00';
        }

        // Calcular subtotal sumando todos los costos parciales
        const subtotal = items.reduce((sum, item) => {
            const cost = parseFloat(item.costoParcial);
            return sum + (isNaN(cost) ? 0 : cost);
        }, 0);

        // Calcular IGV (18%)
        const igv = subtotal * 0.18;
        
        // Calcular total
        const total = subtotal + igv;

        // Retornar el valor solicitado formateado
        switch (type) {
            case 'subtotal':
                return formatCurrency(subtotal);
            case 'igv':
                return formatCurrency(igv);
            case 'total':
                return formatCurrency(total);
            default:
                return '0.00';
        }
    } catch (error) {
        console.error('Error calculando totales:', error);
        return '0.00';
    }
}

/**
 * Helper para formatear el número de cotización
 * @param {string} numero - Número de cotización
 * @returns {string} - Número formateado
 */
function formatQuoteNumber(numero) {
    if (!numero) return '';
    
    // Limpiar y formatear el número
    return numero.toString().toUpperCase().trim();
}

/**
 * Helper para truncar texto largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
function truncateText(text, maxLength = 50) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Helper para formatear el RUC
 * @param {string} ruc - RUC a formatear
 * @returns {string} - RUC formateado
 */
function formatRUC(ruc) {
    if (!ruc) return '';
    
    // Limpiar el RUC
    const cleanRUC = ruc.toString().replace(/\D/g, '');
    
    // Verificar que tenga 11 dígitos
    if (cleanRUC.length === 11) {
        // Formatear como XX.XXX.XXX-XX
        return cleanRUC.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-$4');
    }
    
    return ruc;
}

/**
 * Helper para obtener el nombre del mes en español
 * @param {string} dateString - Fecha
 * @returns {string} - Nombre del mes
 */
function getMonthName(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return months[date.getMonth()];
    } catch (error) {
        return '';
    }
}

/**
 * Helper para formatear fecha completa en español
 * @param {string} dateString - Fecha
 * @returns {string} - Fecha formateada en español
 */
function formatDateSpanish(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        
        const day = date.getDate();
        const month = getMonthName(dateString);
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    } catch (error) {
        return formatDate(dateString);
    }
}
