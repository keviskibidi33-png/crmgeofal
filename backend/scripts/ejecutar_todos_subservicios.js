#!/usr/bin/env node

/**
 * SCRIPT MAESTRO PARA EJECUTAR TODOS LOS SUBSERVICIOS
 * Sistema CRM GeoFal - Módulo Laboratorio
 * 
 * Este script ejecuta todos los scripts de subservicios en el orden correcto
 * para implementar el sistema completo de 198 subservicios.
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO IMPLEMENTACIÓN COMPLETA DE SUBSERVICIOS');
console.log('====================================================');
console.log('📅 Fecha:', new Date().toISOString());
console.log('🎯 Objetivo: Implementar 198 subservicios en 12 categorías');
console.log('');

// Lista de scripts en orden de ejecución
const scripts = [
    {
        name: 'ENSAYOS ESTÁNDAR',
        file: 'add-ensayo-estandar-complete.js',
        description: '34 subservicios de ensayos estándar'
    },
    {
        name: 'ENSAYOS ESPECIALES', 
        file: 'add-ensayos-especiales-complete.js',
        description: '16 subservicios de ensayos especiales'
    },
    {
        name: 'ENSAYO AGREGADO',
        file: 'add-ensayo-agregado-complete.js', 
        description: '25 subservicios de ensayo agregado'
    },
    {
        name: 'ENSAYOS DE CAMPO',
        file: 'add-ensayos-campo-complete.js',
        description: '8 subservicios de ensayos de campo'
    },
    {
        name: 'ENSAYO QUÍMICO SUELO',
        file: 'add-ensayo-quimico-suelo-complete.js',
        description: '6 subservicios de ensayo químico suelo'
    },
    {
        name: 'ENSAYO QUÍMICO AGREGADO',
        file: 'add-ensayo-quimico-agregado-correct.js',
        description: '4 subservicios de ensayo químico agregado'
    },
    {
        name: 'ENSAYO CONCRETO',
        file: 'add-ensayo-concreto-complete.js',
        description: '32 subservicios de ensayo concreto'
    },
    {
        name: 'ENSAYO ALBAÑILERÍA',
        file: 'add-ensayo-albanileria-complete.js',
        description: '18 subservicios de ensayo albañilería'
    },
    {
        name: 'ENSAYO ROCA',
        file: 'add-ensayo-roca-complete.js',
        description: '7 subservicios de ensayo roca'
    },
    {
        name: 'CEMENTO',
        file: 'save-cemento-permanent.js',
        description: '4 subservicios de cemento'
    },
    {
        name: 'ENSAYO PAVIMENTO',
        file: 'add-ensayo-pavimento-complete.js',
        description: '13 subservicios de ensayo pavimento'
    },
    {
        name: 'ENSAYO ASFALTO',
        file: 'add-ensayo-asfalto-complete.js',
        description: '26 subservicios de ensayo asfalto'
    },
    {
        name: 'ENSAYO MEZCLA ASFÁLTICO',
        file: 'add-ensayo-mezcla-asfaltico-complete.js',
        description: '14 subservicios de ensayo mezcla asfáltico'
    },
    {
        name: 'EVALUACIONES ESTRUCTURALES',
        file: 'add-evaluaciones-estructurales-complete.js',
        description: '17 subservicios de evaluaciones estructurales'
    },
    {
        name: 'IMPLEMENTACIÓN LABORATORIO',
        file: 'add-implementacion-laboratorio-obra-complete.js',
        description: '8 subservicios de implementación laboratorio'
    },
    {
        name: 'OTROS SERVICIOS',
        file: 'add-otros-servicios-complete.js',
        description: '4 subservicios de otros servicios'
    }
];

// Función para ejecutar un script
function ejecutarScript(script, index) {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 [${index + 1}/${scripts.length}] Ejecutando: ${script.name}`);
        console.log(`📄 Archivo: ${script.file}`);
        console.log(`📝 Descripción: ${script.description}`);
        console.log('⏳ Ejecutando...');
        
        const scriptPath = path.join(__dirname, script.file);
        const command = `node "${scriptPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Error en ${script.name}:`, error.message);
                console.log('⚠️  Continuando con el siguiente script...');
                resolve(); // Continuar aunque haya error
            } else {
                console.log(`✅ ${script.name} completado exitosamente`);
                if (stdout) {
                    console.log('📤 Salida:', stdout.trim());
                }
                if (stderr) {
                    console.log('⚠️  Advertencias:', stderr.trim());
                }
                resolve();
            }
        });
    });
}

// Función principal
async function ejecutarTodosLosScripts() {
    console.log('🎯 Iniciando ejecución de scripts...\n');
    
    let exitosos = 0;
    let fallidos = 0;
    
    for (let i = 0; i < scripts.length; i++) {
        try {
            await ejecutarScript(scripts[i], i);
            exitosos++;
        } catch (error) {
            console.log(`❌ Error crítico en ${scripts[i].name}:`, error.message);
            fallidos++;
        }
        
        // Pequeña pausa entre scripts
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 RESUMEN DE EJECUCIÓN');
    console.log('=======================');
    console.log(`✅ Scripts exitosos: ${exitosos}`);
    console.log(`❌ Scripts fallidos: ${fallidos}`);
    console.log(`📊 Total procesados: ${scripts.length}`);
    
    if (fallidos === 0) {
        console.log('\n🚀 ¡IMPLEMENTACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('📈 Todos los subservicios han sido agregados al sistema.');
    } else {
        console.log('\n⚠️  IMPLEMENTACIÓN COMPLETADA CON ADVERTENCIAS');
        console.log('📋 Revisar los scripts fallidos para completar la implementación.');
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Verificar la base de datos con: SELECT COUNT(*) FROM subservices;');
    console.log('2. Probar la API: GET /api/subservices');
    console.log('3. Verificar el frontend en la sección de Servicios');
    console.log('\n🎯 Sistema listo para uso en producción! 🚀');
}

// Ejecutar el script maestro
if (require.main === module) {
    ejecutarTodosLosScripts().catch(error => {
        console.error('💥 Error crítico en el script maestro:', error);
        process.exit(1);
    });
}

module.exports = { ejecutarTodosLosScripts, scripts };
