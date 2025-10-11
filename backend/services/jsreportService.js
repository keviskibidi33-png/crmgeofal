const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Servicio de jsreport para generación de PDFs en producción
 * Integración completa con el sistema CRM
 */
class JsreportService {
    constructor() {
        this.baseURL = process.env.JSREPORT_URL || 'http://localhost:5488';
        this.timeout = parseInt(process.env.JSREPORT_TIMEOUT) || 30000;
        this.retryAttempts = parseInt(process.env.JSREPORT_RETRY_ATTEMPTS) || 3;
        this.retryDelay = parseInt(process.env.JSREPORT_RETRY_DELAY) || 1000;
    }

    /**
     * Verificar si el servidor jsreport está disponible
     */
    async checkServerHealth() {
        try {
            const response = await axios.get(`${this.baseURL}/api/version`, {
                timeout: 5000
            });
            logger.info(`jsreport server version: ${response.data}`);
            return true;
        } catch (error) {
            logger.error('jsreport server not available:', error.message);
            return false;
        }
    }

    /**
     * Generar PDF de cotización con reintentos automáticos
     */
    async generarCotizacionPDF(datosCotizacion, options = {}) {
        const {
            saveToDisk = true,
            outputDir = path.join(process.cwd(), 'uploads', 'cotizaciones'),
            fileName = null
        } = options;

        let lastError = null;

        // Reintentos automáticos
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                logger.info(`Generando PDF de cotización (intento ${attempt}/${this.retryAttempts})`);
                
                // Validar datos de entrada
                this.validarDatosCotizacion(datosCotizacion);

                // Preparar datos para jsreport
                const datosProcesados = this.procesarDatosCotizacion(datosCotizacion);

                // Configurar petición
                const requestBody = {
                    template: { 
                        name: "cotizacion" 
                    },
                    data: datosProcesados
                };

                logger.debug('Enviando petición a jsreport:', {
                    template: requestBody.template,
                    dataKeys: Object.keys(datosProcesados)
                });

                // Realizar petición HTTP
                const response = await axios.post(`${this.baseURL}/api/report`, requestBody, {
                    responseType: 'arraybuffer',
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                logger.info('PDF generado exitosamente por jsreport');

                // Procesar respuesta
                if (saveToDisk) {
                    const filePath = await this.guardarPDF(response.data, outputDir, fileName, datosCotizacion);
                    return {
                        success: true,
                        filePath: filePath,
                        size: response.data.length,
                        sizeKB: (response.data.length / 1024).toFixed(2)
                    };
                } else {
                    return {
                        success: true,
                        buffer: response.data,
                        size: response.data.length,
                        sizeKB: (response.data.length / 1024).toFixed(2)
                    };
                }

            } catch (error) {
                lastError = error;
                logger.warn(`Intento ${attempt} falló:`, error.message);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        // Si todos los intentos fallaron
        logger.error('Falló la generación de PDF después de todos los intentos:', lastError.message);
        throw new Error(`Error generando PDF: ${lastError.message}`);
    }

    /**
     * Validar datos de cotización
     */
    validarDatosCotizacion(datos) {
        const camposRequeridos = ['numeroCotizacion', 'cliente', 'proyecto', 'items'];
        
        for (const campo of camposRequeridos) {
            if (!datos[campo]) {
                throw new Error(`Campo requerido faltante: ${campo}`);
            }
        }

        if (!Array.isArray(datos.items) || datos.items.length === 0) {
            throw new Error('La cotización debe tener al menos un ítem');
        }

        // Validar estructura del cliente
        const clienteRequerido = ['nombre', 'ruc'];
        for (const campo of clienteRequerido) {
            if (!datos.cliente[campo]) {
                throw new Error(`Campo requerido del cliente faltante: ${campo}`);
            }
        }
    }

    /**
     * Procesar y normalizar datos de cotización
     */
    procesarDatosCotizacion(datos) {
        return {
            numeroCotizacion: datos.numeroCotizacion || 'SIN-NUMERO',
            fechaEmision: datos.fechaEmision || new Date().toISOString().split('T')[0],
            cliente: {
                nombre: datos.cliente.nombre || 'Cliente no especificado',
                ruc: datos.cliente.ruc || '00000000000',
                contacto: datos.cliente.contacto || 'No especificado',
                telefono: datos.cliente.telefono || 'No especificado',
                correo: datos.cliente.correo || 'No especificado'
            },
            proyecto: {
                nombre: datos.proyecto.nombre || 'Proyecto no especificado',
                ubicacion: datos.proyecto.ubicacion || 'No especificada'
            },
            asesor: {
                nombre: datos.asesor?.nombre || 'No especificado'
            },
            referencia: datos.referencia || '',
            items: datos.items.map(item => ({
                codigo: item.codigo || 'N/A',
                descripcion: item.descripcion || 'Descripción no especificada',
                norma: item.norma || 'No especificada',
                acreditacion: item.acreditacion || '(*)',
                cantidad: parseInt(item.cantidad) || 1,
                costoParcial: parseFloat(item.costoParcial) || 0
            }))
        };
    }

    /**
     * Guardar PDF en disco
     */
    async guardarPDF(buffer, outputDir, fileName, datosCotizacion) {
        try {
            // Crear directorio si no existe
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
                logger.info(`Directorio creado: ${outputDir}`);
            }

            // Generar nombre de archivo si no se proporciona
            if (!fileName) {
                const timestamp = Date.now();
                const numeroCotizacion = (datosCotizacion.numeroCotizacion || 'COT')
                    .replace(/[^a-zA-Z0-9]/g, '_');
                fileName = `cotizacion_${numeroCotizacion}_${timestamp}.pdf`;
            }

            const filePath = path.join(outputDir, fileName);
            
            // Guardar archivo
            fs.writeFileSync(filePath, buffer);
            
            logger.info(`PDF guardado en: ${filePath}`);
            return filePath;

        } catch (error) {
            logger.error('Error guardando PDF:', error.message);
            throw new Error(`Error guardando archivo: ${error.message}`);
        }
    }

    /**
     * Obtener lista de plantillas disponibles
     */
    async obtenerPlantillas() {
        try {
            // Intentar diferentes endpoints para obtener plantillas
            const endpoints = [
                '/api/templates',
                '/api/template',
                '/api/report/templates'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(`${this.baseURL}${endpoint}`, {
                        timeout: 5000
                    });
                    
                    if (response.data && Array.isArray(response.data)) {
                        return response.data;
                    }
                } catch (error) {
                    // Continuar con el siguiente endpoint
                    continue;
                }
            }

            // Si no se puede obtener la lista, retornar plantilla conocida
            return [{
                name: 'cotizacion',
                shortid: 'koo',
                engine: 'handlebars',
                recipe: 'chrome-pdf'
            }];

        } catch (error) {
            logger.warn('No se pudieron obtener las plantillas:', error.message);
            return [];
        }
    }

    /**
     * Probar plantilla específica
     */
    async probarPlantilla(nombrePlantilla, datosPrueba = null) {
        try {
            const datos = datosPrueba || {
                numeroCotizacion: "PRUEBA-001",
                fechaEmision: new Date().toISOString().split('T')[0],
                cliente: {
                    nombre: "Cliente de Prueba",
                    ruc: "12345678901",
                    contacto: "Contacto Prueba",
                    telefono: "999-999-999",
                    correo: "prueba@test.com"
                },
                proyecto: {
                    nombre: "Proyecto de Prueba",
                    ubicacion: "Lima, Perú"
                },
                asesor: {
                    nombre: "Asesor Prueba"
                },
                items: [{
                    codigo: "TEST-001",
                    descripcion: "Servicio de prueba",
                    norma: "NTP 001",
                    acreditacion: "(*)",
                    cantidad: 1,
                    costoParcial: "100.00"
                }]
            };

            const response = await axios.post(`${this.baseURL}/api/report`, {
                template: { name: nombrePlantilla },
                data: datos
            }, {
                responseType: 'arraybuffer',
                timeout: this.timeout,
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                success: true,
                size: response.data.length,
                sizeKB: (response.data.length / 1024).toFixed(2)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Utilidad para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Crear instancia singleton
const jsreportService = new JsreportService();

module.exports = jsreportService;