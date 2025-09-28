-- Historial de exportaciones
CREATE TABLE IF NOT EXISTS export_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  client_id INTEGER REFERENCES companies(id),
  project_id INTEGER REFERENCES projects(id),
  commercial_id INTEGER REFERENCES users(id),
  laboratory_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'nuevo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_history_type ON export_history(type);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);
CREATE INDEX IF NOT EXISTS idx_export_history_client_id ON export_history(client_id);
CREATE INDEX IF NOT EXISTS idx_export_history_project_id ON export_history(project_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(status);