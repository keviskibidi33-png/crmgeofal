-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'media', -- baja, media, alta, critica
  status VARCHAR(20) NOT NULL DEFAULT 'abierto', -- abierto, en_progreso, resuelto, cerrado
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);

-- Historial de acciones en tickets
CREATE TABLE IF NOT EXISTS ticket_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  performed_by INTEGER REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);
