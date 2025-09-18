// Audit routes
const auditRoutes = require('./routes/auditRoutes');
app.use('/api/audit', auditRoutes);
// Lead routes
const leadRoutes = require('./routes/leadRoutes');
app.use('/api/leads', leadRoutes);
// Evidence routes
const evidenceRoutes = require('./routes/evidenceRoutes');
app.use('/api/evidences', evidenceRoutes);
// Invoice routes
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);
// Service routes
const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

// Subservice routes
const subserviceRoutes = require('./routes/subserviceRoutes');
app.use('/api/subservices', subserviceRoutes);

// ProjectService routes
const projectServiceRoutes = require('./routes/projectServiceRoutes');
app.use('/api/project-services', projectServiceRoutes);
// Para servir archivos adjuntos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ticket routes
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);
// Rate limiting
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
});
app.use(apiLimiter);
// Report routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);
// Project history routes
const projectHistoryRoutes = require('./routes/projectHistoryRoutes');
app.use('/api/project-history', projectHistoryRoutes);
// Category routes
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

// Subcategory routes
const subcategoryRoutes = require('./routes/subcategoryRoutes');
app.use('/api/subcategories', subcategoryRoutes);
// Quote routes
const quoteRoutes = require('./routes/quoteRoutes');
app.use('/api/quotes', quoteRoutes);
// Project routes
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);
// Export routes (Excel/PDF)
const exportRoutes = require('./routes/exportRoutes');
app.use('/api/export', exportRoutes);
// Backend entry point

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const winston = require('winston');
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

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Example route
app.get('/', (req, res) => {
  res.send('CRM Backend running');
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Company routes
const companyRoutes = require('./routes/companyRoutes');
app.use('/api/companies', companyRoutes);

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
