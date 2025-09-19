
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
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Test DB connection on startup
const pool = require('./config/db');
pool.query('SELECT NOW()')
  .then(res => console.log('PostgreSQL connected:', res.rows[0].now))
  .catch(err => console.error('PostgreSQL connection error:', err));

module.exports = app;

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
