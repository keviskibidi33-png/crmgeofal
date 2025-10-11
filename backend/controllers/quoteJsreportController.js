const { generarCotizacionPDF, verificarServidorJsreport } = require('../services/jsreportService');
const Quote = require('../models/quote');

/**
 * Controlador para la generación de PDFs usando jsreport
 * Integra con el sistema de cotizaciones existente
 */

/**
 * Genera un PDF de cotización usando jsreport
 * POST /api/quotes/:id/generate-pdf
 */
exports.generatePDF = async (req, res) => {
    try {
        const quoteId = req.params.id;
        console.log('🔄 Generando PDF para cotización ID:', quoteId);

        // Verificar que el servidor jsreport esté disponible
        const servidorDisponible = await verificarServidorJsreport();
        if (!servidorDisponible) {
            return res.status(503).json({
                error: 'Servidor de reportes no disponible',
                message: 'El servidor jsreport no está ejecutándose en http://localhost:5488'
            });
        }

        // Obtener los datos de la cotización desde la base de datos
        const quote = await Quote.getById(quoteId);
        if (!quote) {
            return res.status(404).json({ error: 'Cotización no encontrada' });
        }

        // Parsear los datos del meta si están en formato JSON
        let meta = null;
        if (quote.meta && typeof quote.meta === 'string') {
            try {
                meta = JSON.parse(quote.meta);
            } catch (e) {
                console.warn('⚠️ Error al parsear meta de la cotización:', e.message);
                meta = null;
            }
        } else if (quote.meta && typeof quote.meta === 'object') {
            meta = quote.meta;
        }

        // Estructurar los datos para jsreport
        const datosParaJsreport = {
            numeroCotizacion: quote.quote_number || `COT-${quote.id}`,
            fechaEmision: quote.issue_date || new Date().toISOString().split('T')[0],
            cliente: {
                nombre: quote.client_company || meta?.customer?.company_name || 'Cliente',
                ruc: quote.client_ruc || meta?.customer?.ruc || '',
                contacto: quote.client_contact || meta?.customer?.contact_name || '',
                telefono: quote.client_phone || meta?.customer?.contact_phone || '',
                correo: quote.client_email || meta?.customer?.contact_email || ''
            },
            proyecto: {
                nombre: quote.project_name || meta?.customer?.project_name || 'Proyecto',
                ubicacion: quote.project_location || meta?.customer?.project_location || ''
            },
            asesor: {
                nombre: quote.created_by_name || 'Asesor Comercial'
            },
            referencia: quote.reference || meta?.quote?.reference || '',
            items: meta?.items || [],
            totales: {
                parcial: quote.subtotal || 0,
                igv: quote.igv || 0,
                total: quote.total || 0
            }
        };

        console.log('📋 Datos estructurados para jsreport:', {
            numeroCotizacion: datosParaJsreport.numeroCotizacion,
            cliente: datosParaJsreport.cliente.nombre,
            items: datosParaJsreport.items.length,
            total: datosParaJsreport.totales.total
        });

        // Generar el PDF usando jsreport
        const rutaPDF = await generarCotizacionPDF(datosParaJsreport);

        if (!rutaPDF) {
            return res.status(500).json({
                error: 'Error al generar PDF',
                message: 'No se pudo generar el archivo PDF de la cotización'
            });
        }

        // Enviar el archivo PDF como respuesta
        res.download(rutaPDF, `cotizacion_${datosParaJsreport.numeroCotizacion}.pdf`, (err) => {
            if (err) {
                console.error('❌ Error al enviar archivo PDF:', err);
                res.status(500).json({ error: 'Error al enviar archivo PDF' });
            } else {
                console.log('✅ PDF enviado exitosamente al cliente');
            }
        });

    } catch (error) {
        console.error('❌ Error en generatePDF:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
};

/**
 * Genera un PDF de cotización con datos personalizados
 * POST /api/quotes/generate-pdf-custom
 */
exports.generatePDFCustom = async (req, res) => {
    try {
        const { datosCotizacion } = req.body;

        if (!datosCotizacion) {
            return res.status(400).json({
                error: 'Datos de cotización requeridos',
                message: 'El campo "datosCotizacion" es obligatorio'
            });
        }

        console.log('🔄 Generando PDF personalizado...');

        // Verificar que el servidor jsreport esté disponible
        const servidorDisponible = await verificarServidorJsreport();
        if (!servidorDisponible) {
            return res.status(503).json({
                error: 'Servidor de reportes no disponible',
                message: 'El servidor jsreport no está ejecutándose en http://localhost:5488'
            });
        }

        // Generar el PDF usando jsreport
        const rutaPDF = await generarCotizacionPDF(datosCotizacion);

        if (!rutaPDF) {
            return res.status(500).json({
                error: 'Error al generar PDF',
                message: 'No se pudo generar el archivo PDF de la cotización'
            });
        }

        // Enviar el archivo PDF como respuesta
        const nombreArchivo = `cotizacion_${datosCotizacion.numeroCotizacion || 'custom'}.pdf`;
        res.download(rutaPDF, nombreArchivo, (err) => {
            if (err) {
                console.error('❌ Error al enviar archivo PDF:', err);
                res.status(500).json({ error: 'Error al enviar archivo PDF' });
            } else {
                console.log('✅ PDF personalizado enviado exitosamente al cliente');
            }
        });

    } catch (error) {
        console.error('❌ Error en generatePDFCustom:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message
        });
    }
};

/**
 * Verifica el estado del servidor jsreport
 * GET /api/quotes/jsreport-status
 */
exports.getJsreportStatus = async (req, res) => {
    try {
        const servidorDisponible = await verificarServidorJsreport();
        
        res.json({
            servidorDisponible,
            url: 'http://localhost:5488',
            mensaje: servidorDisponible 
                ? 'Servidor jsreport funcionando correctamente'
                : 'Servidor jsreport no disponible'
        });

    } catch (error) {
        console.error('❌ Error al verificar estado de jsreport:', error);
        res.status(500).json({
            error: 'Error al verificar estado del servidor',
            message: error.message
        });
    }
};
