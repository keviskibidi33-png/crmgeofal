const jsreportService = require('../services/jsreportService');
const Quote = require('../models/Quote');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

/**
 * Controlador para operaciones de jsreport
 */
class JsreportController {
    
    /**
     * Generar PDF de cotización desde ID de cotización
     */
    async generarPDFPorId(req, res) {
        try {
            const { id } = req.params;
            const { saveToDisk = true } = req.query;

            logger.info(`Generando PDF para cotización ID: ${id}`);

            // Obtener cotización de la base de datos
            const cotizacion = await Quote.findById(id);
            if (!cotizacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Cotización no encontrada'
                });
            }

            // Convertir datos de la cotización al formato esperado por jsreport
            const datosCotizacion = this.convertirDatosCotizacion(cotizacion);

            // Generar PDF
            const resultado = await jsreportService.generarCotizacionPDF(datosCotizacion, {
                saveToDisk: saveToDisk === 'true',
                fileName: `cotizacion_${cotizacion._id}.pdf`
            });

            res.json({
                success: true,
                message: 'PDF generado exitosamente',
                data: resultado
            });

        } catch (error) {
            logger.error('Error generando PDF por ID:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error generando PDF',
                error: error.message
            });
        }
    }

    /**
     * Generar PDF de cotización desde datos directos
     */
    async generarPDFDirecto(req, res) {
        try {
            const datosCotizacion = req.body;
            const { saveToDisk = true } = req.query;

            logger.info('Generando PDF desde datos directos');

            // Generar PDF
            const resultado = await jsreportService.generarCotizacionPDF(datosCotizacion, {
                saveToDisk: saveToDisk === 'true'
            });

            res.json({
                success: true,
                message: 'PDF generado exitosamente',
                data: resultado
            });

        } catch (error) {
            logger.error('Error generando PDF directo:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error generando PDF',
                error: error.message
            });
        }
    }

    /**
     * Obtener estado del servidor jsreport
     */
    async obtenerEstadoServidor(req, res) {
        try {
            const isHealthy = await jsreportService.checkServerHealth();
            const plantillas = await jsreportService.obtenerPlantillas();

            res.json({
                success: true,
                data: {
                    serverHealthy: isHealthy,
                    baseURL: jsreportService.baseURL,
                    templates: plantillas,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            logger.error('Error obteniendo estado del servidor:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estado del servidor',
                error: error.message
            });
        }
    }

    /**
     * Probar plantilla específica
     */
    async probarPlantilla(req, res) {
        try {
            const { nombrePlantilla } = req.params;
            const datosPrueba = req.body;

            logger.info(`Probando plantilla: ${nombrePlantilla}`);

            const resultado = await jsreportService.probarPlantilla(nombrePlantilla, datosPrueba);

            res.json({
                success: true,
                data: resultado
            });

        } catch (error) {
            logger.error('Error probando plantilla:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error probando plantilla',
                error: error.message
            });
        }
    }

    /**
     * Descargar PDF generado
     */
    async descargarPDF(req, res) {
        try {
            const { fileName } = req.params;
            const filePath = path.join(process.cwd(), 'uploads', 'cotizaciones', fileName);

            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Archivo PDF no encontrado'
                });
            }

            // Enviar archivo
            res.download(filePath, fileName, (err) => {
                if (err) {
                    logger.error('Error descargando PDF:', err.message);
                    res.status(500).json({
                        success: false,
                        message: 'Error descargando archivo'
                    });
                }
            });

        } catch (error) {
            logger.error('Error en descarga de PDF:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error descargando PDF',
                error: error.message
            });
        }
    }

    /**
     * Convertir datos de cotización de MongoDB al formato de jsreport
     */
    convertirDatosCotizacion(cotizacion) {
        try {
            // Parsear meta si es string
            let meta = cotizacion.meta;
            if (typeof meta === 'string') {
                meta = JSON.parse(meta);
            }

            // Extraer información del cliente
            const cliente = meta?.cliente || {
                nombre: 'Cliente no especificado',
                ruc: '00000000000',
                contacto: 'No especificado',
                telefono: 'No especificado',
                correo: 'No especificado'
            };

            // Extraer información del proyecto
            const proyecto = meta?.proyecto || {
                nombre: 'Proyecto no especificado',
                ubicacion: 'No especificada'
            };

            // Extraer ítems
            const items = meta?.items || cotizacion.items || [];

            // Generar número de cotización si no existe
            const numeroCotizacion = cotizacion.numeroCotizacion || 
                `COT-${new Date().getFullYear()}-${String(cotizacion._id).slice(-6)}`;

            return {
                numeroCotizacion: numeroCotizacion,
                fechaEmision: cotizacion.createdAt ? 
                    new Date(cotizacion.createdAt).toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0],
                cliente: {
                    nombre: cliente.nombre || 'Cliente no especificado',
                    ruc: cliente.ruc || '00000000000',
                    contacto: cliente.contacto || 'No especificado',
                    telefono: cliente.telefono || 'No especificado',
                    correo: cliente.correo || 'No especificado'
                },
                proyecto: {
                    nombre: proyecto.nombre || 'Proyecto no especificado',
                    ubicacion: proyecto.ubicacion || 'No especificada'
                },
                asesor: {
                    nombre: meta?.asesor?.nombre || 'No especificado'
                },
                referencia: meta?.referencia || '',
                items: items.map(item => ({
                    codigo: item.codigo || 'N/A',
                    descripcion: item.descripcion || 'Descripción no especificada',
                    norma: item.norma || 'No especificada',
                    acreditacion: item.acreditacion || '(*)',
                    cantidad: parseInt(item.cantidad) || 1,
                    costoParcial: parseFloat(item.costoParcial) || 0
                }))
            };

        } catch (error) {
            logger.error('Error convirtiendo datos de cotización:', error.message);
            throw new Error('Error procesando datos de cotización');
        }
    }
}

module.exports = new JsreportController();
