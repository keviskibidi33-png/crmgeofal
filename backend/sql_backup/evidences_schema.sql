-- Tabla de evidencias documentales
CREATE TABLE IF NOT EXISTS evidences (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);