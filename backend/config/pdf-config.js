/**
 * Configuración del Sistema de PDFs
 */

module.exports = {
  // Sistema de PDFs a usar
  // 'template' = Sistema basado en plantilla existente
  // 'html' = Sistema HTML + CSS
  // 'pdfkit' = Sistema tradicional con PDFKit
  pdfSystem: 'template', // Usar sistema basado en plantilla existente por defecto
  
  // Rutas de plantillas
  templates: {
    professional: 'templates/cotizacion_professional_template.pdf',
    basic: 'templates/cotizacion_template.pdf'
  },
  
  
  // Configuración de campos de formulario
  formFields: {
    // Información del cliente
    cliente: [
      'nombre_cliente',
      'ruc_cliente', 
      'contacto_cliente',
      'telefono_cliente',
      'email_cliente'
    ],
    
    // Información del proyecto
    proyecto: [
      'nombre_proyecto',
      'ubicacion_proyecto',
      'asesor_comercial',
      'fecha_emision'
    ],
    
    // Cotización
    cotizacion: [
      'numero_cotizacion',
      'subtotal',
      'igv', 
      'total'
    ],
    
    // Ítems (máximo 10)
    items: Array.from({length: 10}, (_, i) => [
      `item${i+1}_codigo`,
      `item${i+1}_descripcion`,
      `item${i+1}_norma`,
      `item${i+1}_precio_unitario`,
      `item${i+1}_cantidad`
    ]).flat()
  }
};
