// Configuración base para Nodemailer
// FALTA: Integrar con credenciales SMTP reales
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || 'usuario',
    pass: process.env.SMTP_PASS || 'contraseña',
  },
});

module.exports = transporter;
