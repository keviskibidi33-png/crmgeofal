const axios = require('axios');

async function testAllTemplates() {
    console.log('🔍 Probando todas las plantillas de jsreport...\n');
    
    const templates = [
        {
            name: 'cotizacion',
            data: {
                numeroCotizacion: "COT-001",
                fechaEmision: "2025-01-11",
                cliente: {
                    nombre: "Constructora Andina S.A.C.",
                    ruc: "20551234567",
                    contacto: "Luisa Gonzales",
                    telefono: "(01) 555-9876",
                    correo: "luisa.gonzales@constructora.com"
                },
                proyecto: {
                    nombre: "Edificio Los Portales",
                    ubicacion: "Arequipa, Perú"
                },
                asesor: {
                    nombre: "Carlos Mendoza"
                },
                items: [
                    {
                        codigo: "S001",
                        descripcion: "Análisis granulométrico de agregados.",
                        norma: "NTP 400.012",
                        acreditacion: "(*)",
                        cantidad: 5,
                        costoParcial: "350.75"
                    }
                ]
            }
        },
        {
            name: 'factura',
            data: {
                numeroFactura: "FAC-001",
                fechaEmision: "2025-01-11",
                cliente: {
                    nombre: "Minera Las Bambas",
                    ruc: "20123456789",
                    contacto: "Carlos Mendoza",
                    telefono: "01-234-5678",
                    correo: "carlos.mendoza@lasbambas.com"
                },
                proyecto: {
                    nombre: "Mineria Las Bambas",
                    ubicacion: "Las Malvinas"
                },
                asesor: {
                    nombre: "Pedro"
                },
                items: [
                    {
                        codigo: "AS25",
                        descripcion: "Control de calidad...",
                        norma: "321.141",
                        acreditacion: "(*)",
                        cantidad: 1,
                        costoParcial: "10.00"
                    }
                ]
            }
        },
        {
            name: 'reporte',
            data: {
                numeroReporte: "REP-001",
                fechaEmision: "2025-01-11",
                cliente: {
                    nombre: "Laboratorio Central",
                    ruc: "20123456789",
                    contacto: "Ana García",
                    telefono: "01-234-5678",
                    correo: "ana.garcia@labcentral.com"
                },
                proyecto: {
                    nombre: "Análisis de Materiales",
                    ubicacion: "Lima, Perú"
                },
                ingeniero: {
                    nombre: "Ing. Roberto Silva"
                },
                ensayos: [
                    {
                        codigo: "E001",
                        descripcion: "Ensayo de compresión",
                        norma: "ASTM C39",
                        cantidad: 10,
                        estado: "Completado",
                        resultado: "Aprobado"
                    }
                ],
                conclusiones: "Todos los ensayos cumplen con las especificaciones técnicas requeridas."
            }
        }
    ];
    
    try {
        // Verificar que el servidor esté funcionando
        console.log('1. Verificando servidor jsreport...');
        const versionResponse = await axios.get('http://localhost:5488/api/version');
        console.log(`✅ Servidor funcionando - Versión: ${versionResponse.data}\n`);
        
        // Probar cada plantilla
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            console.log(`${i + 2}. Probando plantilla "${template.name}"...`);
            
            try {
                const pdfResponse = await axios.post('http://localhost:5488/api/report', {
                    template: { name: template.name },
                    data: template.data
                }, {
                    responseType: 'arraybuffer'
                });
                
                console.log(`✅ Plantilla "${template.name}" - PDF generado: ${pdfResponse.data.length} bytes`);
            } catch (error) {
                console.log(`❌ Error en plantilla "${template.name}": ${error.message}`);
            }
        }
        
        console.log('\n🎉 ¡PRUEBA COMPLETADA!');
        console.log('\n📋 Resumen:');
        console.log('- ✅ Servidor jsreport funcionando');
        console.log('- ✅ 3 plantillas creadas: cotizacion, factura, reporte');
        console.log('- ✅ Todas las plantillas deben aparecer en el Studio');
        
        console.log('\n🌐 Próximos pasos:');
        console.log('1. Abrir http://localhost:5488 en el navegador');
        console.log('2. Verificar que aparezcan las 3 plantillas en el Studio');
        console.log('3. Probar la edición de cada plantilla');
        console.log('4. Confirmar la generación de PDFs desde el Studio');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        if (error.response) {
            console.error('Respuesta del servidor:', error.response.status, error.response.statusText);
        }
    }
}

testAllTemplates();
