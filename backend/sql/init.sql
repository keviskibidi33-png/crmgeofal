-- Active: 1758228890663@@127.0.0.1@5432@postgres
-- Tabla de usuarios para CRMGeoFal
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Puedes agregar más tablas aquí según el modelo de negocio
