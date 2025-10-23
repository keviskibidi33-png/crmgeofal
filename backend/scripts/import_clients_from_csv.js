/*
 * Script para importar clientes desde archivos CSV al sistema de CRM.
 *
 * Reglas principales:
 * - RUC que inicia en 20 => Tipo "empresa" (se almacena en campo ruc).
 * - RUC que inicia en 10 => Tipo "persona" (se utiliza ruc completo y se deriva DNI).
 * - Si no se encuentra RUC válido se omite el registro.
 * - Datos faltantes se completan con valores predeterminados (Lima, Servicios, etc.).
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const Company = require('../models/company');
const pool = require('../config/db');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'Basedeclientes2025');

const CSV_FILES = [
  {
    name: 'clientes_vs_coso_nuevo.csv',
    primaryField: 'cliente_original',
    matchedNameField: 'matched_razon',
  },
  {
    name: 'control_vs_coso_matches.csv',
    primaryField: 'control_name',
    matchedNameField: 'matched_razon',
  },
];

const DEFAULT_CLIENT_DATA = {
  address: 'Lima, Perú',
  city: 'lima',
  sector: 'servicios',
  priority: 'normal',
  actividad: 'Importado desde CSV',
  servicios: 'Por definir',
  contact_name: 'Pendiente',
};

const DIGITS_REGEX = /\d+/g;

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    if (!fs.existsSync(filePath)) {
      return resolve(rows);
    }

    fs.createReadStream(filePath, { encoding: 'utf-8' })
      .pipe(csv({ separator: ',', skipLines: 0, trim: true }))
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function sanitizeText(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeJsonish(value) {
  if (!value || value.trim() === '' || value.trim() === '[]') return null;

  let normalized = value.trim();

  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1);
  }

  normalized = normalized.replace(/""/g, '"');

  try {
    return JSON.parse(normalized);
  } catch (error) {
    return null;
  }
}

function extractRuc(row) {
  const candidates = [];

  if (row.matched_ruc) {
    candidates.push(row.matched_ruc);
  }

  if (row.match_source) {
    candidates.push(row.match_source);
  }

  if (row.raw_matches) {
    const parsed = normalizeJsonish(row.raw_matches);
    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        if (Array.isArray(entry) && entry.length > 1) {
          candidates.push(entry[1]);
        }
      });
    }
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const digitsOnly = String(candidate).match(DIGITS_REGEX);
    if (!digitsOnly) continue;

    const joined = digitsOnly.join('');
    if (joined.length === 11 && (joined.startsWith('10') || joined.startsWith('20'))) {
      return joined;
    }
  }

  return null;
}

function buildClientName(row, mapping) {
  const { primaryField, matchedNameField } = mapping;

  const rawMatched = sanitizeText(row[matchedNameField]);
  const rawPrimary = sanitizeText(row[primaryField]);
  const normalized = sanitizeText(row.norm_name);

  return rawMatched || rawPrimary || normalized;
}

function deriveClientData(row, mapping) {
  const ruc = extractRuc(row);
  if (!ruc) return null;

  const name = buildClientName(row, mapping);
  if (!name) return null;

  const client = {
    name,
    email: '',
    phone: '',
    ...DEFAULT_CLIENT_DATA,
  };

  if (ruc.startsWith('20')) {
    client.type = 'empresa';
    client.ruc = ruc;
    client.dni = null;
  } else if (ruc.startsWith('10')) {
    client.type = 'persona';
    client.ruc = ruc;
    const possibleDni = ruc.slice(2, 10);
    client.dni = possibleDni && possibleDni.length === 8 ? possibleDni : null;
    client.contact_name = client.contact_name === DEFAULT_CLIENT_DATA.contact_name ? name : client.contact_name;
  } else {
    return null;
  }

  return client;
}

async function importClients() {
  console.log('🚀 Iniciando importación de clientes desde CSV...');

  const summary = {
    processed: 0,
    inserted: 0,
    skippedExisting: 0,
    skippedInvalid: 0,
    errors: [],
  };

  const processedKeys = new Set();

  for (const fileDef of CSV_FILES) {
    const filePath = path.join(DATA_DIR, fileDef.name);
    console.log(`📄 Procesando archivo: ${fileDef.name}`);

    const rows = await readCsv(filePath);
    console.log(`   • Filas leídas: ${rows.length}`);

    for (const row of rows) {
      summary.processed += 1;

      const client = deriveClientData(row, fileDef);

      if (!client) {
        summary.skippedInvalid += 1;
        continue;
      }

      const uniqueKey = client.ruc || `NAME:${client.name.toLowerCase()}`;
      if (processedKeys.has(uniqueKey)) {
        summary.skippedExisting += 1;
        continue;
      }

      try {
        if (client.ruc) {
          const existingByRuc = await Company.getByRuc(client.ruc);
          if (existingByRuc) {
            processedKeys.add(uniqueKey);
            summary.skippedExisting += 1;
            continue;
          }
        }

        if (client.dni) {
          const existingByDni = await Company.getByDni(client.dni);
          if (existingByDni) {
            processedKeys.add(uniqueKey);
            summary.skippedExisting += 1;
            continue;
          }
        }

        await Company.create({
          type: client.type,
          ruc: client.type === 'empresa' ? client.ruc : null,
          dni: client.type === 'persona' ? client.dni : null,
          name: client.name,
          address: client.address,
          email: client.email,
          phone: client.phone,
          contact_name: client.type === 'persona' ? client.name : client.contact_name,
          city: client.city,
          sector: client.sector,
          priority: client.priority,
          actividad: client.actividad,
          servicios: client.servicios,
        });

        processedKeys.add(uniqueKey);
        summary.inserted += 1;
      } catch (error) {
        console.error('❌ Error al crear cliente:', error.message);
        summary.errors.push({ name: client.name, error: error.message });
      }
    }
  }

  console.log('✅ Importación finalizada');
  console.table({
    'Filas procesadas': summary.processed,
    'Clientes creados': summary.inserted,
    'Omitidos existentes': summary.skippedExisting,
    'Omitidos inválidos': summary.skippedInvalid,
    'Errores': summary.errors.length,
  });

  if (summary.errors.length) {
    console.log('🔎 Detalle de errores:');
    summary.errors.slice(0, 20).forEach((item) => {
      console.log(` - ${item.name}: ${item.error}`);
    });
    if (summary.errors.length > 20) {
      console.log(` ... ${summary.errors.length - 20} errores adicionales`);
    }
  }

  await pool.end();
}

importClients()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error general durante la importación:', error);
    pool.end().finally(() => process.exit(1));
  });
