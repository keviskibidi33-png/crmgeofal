-- Tabla de facturación
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) NOT NULL,
  received_at DATE,
  payment_due DATE,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, vencido
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices recomendados para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
