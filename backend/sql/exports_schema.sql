-- Historial de exportaciones
CREATE TABLE IF NOT EXISTS export_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- pdf, xlsx, csv
  resource VARCHAR(50) NOT NULL, -- leads, projects, quotes, etc
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_export_history_type ON export_history(type);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);
