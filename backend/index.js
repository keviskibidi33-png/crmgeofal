
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 4000;
const http = require('http');
const socketService = require('./services/socketService');
const fs = require('fs');
const dbPath = require('path');

// Logger con winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Seguridad HTTP
app.use(helmet());
app.use(cors());
app.use(express.json());
// Logging HTTP requests
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Para servir archivos adjuntos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
});
app.use(apiLimiter);

// Example route
app.get('/', (req, res) => {
  res.send('CRM Backend running');
});

// Rutas principales
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/evidences', require('./routes/evidenceRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/subservices', require('./routes/subserviceRoutes'));
app.use('/api/project-services', require('./routes/projectServiceRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/project-history', require('./routes/projectHistoryRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subcategories', require('./routes/subcategoryRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/quote-items', require('./routes/quoteItemRoutes'));
app.use('/api/quote-variants', require('./routes/quoteVariantRoutes'));
app.use('/api/audit-quotes', require('./routes/auditQuoteRoutes'));
app.use('/api/project-attachments', require('./routes/projectAttachmentRoutes'));
app.use('/api/project-whatsapp-notices', require('./routes/projectWhatsappNoticeRoutes'));
// Alias para vista global solicitada: /api/whatsapp-notices
app.use('/api/whatsapp-notices', require('./routes/projectWhatsappNoticeRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/recuperados', require('./routes/recuperadosRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// Middleware global de manejo de errores
// Keep the 4-arg signature for Express error middleware. To avoid ESLint warnings about the
// unused `next` parameter while preserving Express's middleware signature we disable the
// no-unused-vars rule on this line.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar WebSocket
socketService.initialize(server);

module.exports = { app, server };

if (require.main === module) {
  // Only test DB connection and run schema when starting the server directly (not when running tests)
  const pool = require('./config/db');

  async function migrateSchemas() {
    try {
      const sqlDir = dbPath.join(__dirname, 'sql');
      if (!fs.existsSync(sqlDir)) return;
      const files = fs.readdirSync(sqlDir)
        .filter(f => f.toLowerCase().endsWith('.sql'))
        .sort();
      for (const f of files) {
        const full = dbPath.join(sqlDir, f);
        const sql = fs.readFileSync(full, 'utf8');
        if (sql && sql.trim()) {
          await pool.query(sql);
          console.log(`[DB] schema applied: ${f}`);
        }
      }
    } catch (e) {
      console.error('[DB] Error applying schemas:', e.message);
      throw e;
    }
  }

  (async () => {
    try {
      if (process.env.MIGRATE_ON_START !== 'false') {
        await migrateSchemas();
      }
      const now = await pool.query('SELECT NOW()');
      console.log('PostgreSQL connected:', now.rows[0].now);
      if (!process.env.JWT_SECRET) {
        throw new Error('Falta la variable de entorno JWT_SECRET');
      }
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`WebSocket habilitado para notificaciones en tiempo real`);
      });
    } catch (err) {
      console.error('Startup error:', err);
      process.exit(1);
    }
  })();
}
