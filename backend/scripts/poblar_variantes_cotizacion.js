const pool = require('../config/db');

async function poblarVariantesCotizacion() {
  try {
    console.log('🚀 POBLANDO VARIANTES DE COTIZACIÓN...');

    // Eliminar variantes existentes para evitar duplicados en cada ejecución
    await pool.query('DELETE FROM quote_variants;');
    console.log('🗑️  Variantes existentes eliminadas');

    const variantsData = [
      {
        code: 'V1',
        title: 'MUESTRA DE SUELO Y AGREGADO',
        description: 'Condiciones para muestras de suelo y agregado.',
        conditions: {
          delivery_days: 4,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SEGÚN LO SOLICITADO VÍA CORREO ELECTRÓNICO / LLAMADA TELEFÓNICA',
          default_items: [
            { code: 'SU04', description: 'Contenido de humedad con Speedy.', norm: 'NTP 339.25', unit_price: 30, quantity: 1 },
            { code: 'SU18', description: 'Capacidad de carga del Suelo (Placa de Carga).', norm: 'ASTM D-1194', unit_price: 2000, quantity: 1 }
          ]
        }
      },
      {
        code: 'V2',
        title: 'PROBETAS',
        description: 'Condiciones para ensayos de probetas.',
        conditions: {
          delivery_days: 5,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE ENSAYOS DE PROBETAS',
          default_items: [
            { code: 'PR01', description: 'Ensayo de resistencia a la compresión.', norm: 'ASTM C39', unit_price: 80, quantity: 3 },
            { code: 'PR02', description: 'Ensayo de resistencia a la flexión.', norm: 'ASTM C78', unit_price: 120, quantity: 2 }
          ]
        }
      },
      {
        code: 'V3',
        title: 'DENSIDAD DE CAMPO Y MUESTREO',
        description: 'Condiciones para ensayos de densidad de campo.',
        conditions: {
          delivery_days: 6,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE DENSIDAD DE CAMPO',
          default_items: [
            { code: 'DC01', description: 'Ensayo de densidad de campo.', norm: 'ASTM D1556', unit_price: 150, quantity: 4 },
            { code: 'DC02', description: 'Ensayo de humedad in situ.', norm: 'ASTM D2216', unit_price: 50, quantity: 4 }
          ]
        }
      },
      {
        code: 'V4',
        title: 'EXTRACCIÓN DE DIAMANTINA',
        description: 'Condiciones para extracción de diamantina.',
        conditions: {
          delivery_days: 8,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE EXTRACCIÓN DE DIAMANTINA',
          default_items: [
            { code: 'ED01', description: 'Extracción de diamantina.', norm: 'ASTM C42', unit_price: 500, quantity: 1 },
            { code: 'ED02', description: 'Ensayo de resistencia a la compresión.', norm: 'ASTM C39', unit_price: 100, quantity: 1 }
          ]
        }
      },
      {
        code: 'V5',
        title: 'DIAMANTINA PARA PASES',
        description: 'Condiciones para diamantina de pases.',
        conditions: {
          delivery_days: 7,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE DIAMANTINA PARA PASES',
          default_items: [
            { code: 'DP01', description: 'Extracción de diamantina para pases.', norm: 'ASTM C42', unit_price: 400, quantity: 1 },
            { code: 'DP02', description: 'Ensayo de resistencia a la compresión.', norm: 'ASTM C39', unit_price: 100, quantity: 1 }
          ]
        }
      },
      {
        code: 'V6',
        title: 'ALBAÑILERÍA',
        description: 'Condiciones para ensayos de albañilería.',
        conditions: {
          delivery_days: 5,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE ENSAYOS DE ALBAÑILERÍA',
          default_items: [
            { code: 'AL01', description: 'Ensayo de resistencia a la compresión.', norm: 'ASTM C140', unit_price: 60, quantity: 20 },
            { code: 'AL02', description: 'Ensayo de absorción de agua.', norm: 'ASTM C140', unit_price: 40, quantity: 20 }
          ]
        }
      },
      {
        code: 'V7',
        title: 'VIGA BECKELMAN',
        description: 'Condiciones para ensayo de viga Beckelman.',
        conditions: {
          delivery_days: 6,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE ENSAYO DE VIGA BECKELMAN',
          default_items: [
            { code: 'VB01', description: 'Ensayo de deflexión con viga Beckelman.', norm: 'ASTM D4694', unit_price: 300, quantity: 1 },
            { code: 'VB02', description: 'Ensayo de módulo de elasticidad.', norm: 'ASTM D4694', unit_price: 200, quantity: 1 }
          ]
        }
      },
      {
        code: 'V8',
        title: 'CONTROL DE CALIDAD DE CONCRETO FRESCO EN OBRA',
        description: 'Condiciones para control de calidad de concreto fresco.',
        conditions: {
          delivery_days: 10,
          default_payment_terms: 'adelantado',
          default_igv: true,
          default_reference: 'SOLICITUD DE CONTROL DE CALIDAD DE CONCRETO',
          default_items: [
            { code: 'CC01', description: 'Ensayo de slump.', norm: 'ASTM C143', unit_price: 30, quantity: 6 },
            { code: 'CC02', description: 'Ensayo de temperatura.', norm: 'ASTM C1064', unit_price: 20, quantity: 6 },
            { code: 'CC03', description: 'Moldeo de probetas.', norm: 'ASTM C31', unit_price: 50, quantity: 6 }
          ]
        }
      }
    ];

    for (const variant of variantsData) {
      const query = `
        INSERT INTO quote_variants (code, title, description, conditions, active)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (code) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          conditions = EXCLUDED.conditions,
          active = EXCLUDED.active,
          created_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;
      const res = await pool.query(query, [
        variant.code,
        variant.title,
        variant.description,
        JSON.stringify(variant.conditions)
      ]);
      console.log(`✅ Variante ${variant.code} insertada: ${variant.title}`);
    }

    const allVariants = await pool.query('SELECT code, title, (conditions->>\'delivery_days\')::int as delivery_days FROM quote_variants ORDER BY code;');
    console.log('\n📊 Total de variantes insertadas:', allVariants.rows.length);
    console.log('\n📋 VARIANTES DISPONIBLES:');
    allVariants.rows.forEach(v => {
      console.log(`   - ${v.code}: ${v.title} (${v.delivery_days} días hábiles)`);
    });

    console.log('\n🎉 ¡VARIANTES POBLADAS EXITOSAMENTE!');
    console.log('✅ Sistema de variantes configurado');
    console.log('✅ Días de entrega configurables por variante');
    console.log('✅ Condiciones específicas por variante');

  } catch (error) {
    console.error('❌ Error al poblar variantes de cotización:', error.message);
  } finally {
    // pool.end(); // No cerrar el pool aquí si se va a usar en otros scripts
  }
}

if (require.main === module) {
  poblarVariantesCotizacion();
} else {
  module.exports = poblarVariantesCotizacion;
}
