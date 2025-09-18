-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(30),
  status VARCHAR(30) NOT NULL DEFAULT 'nuevo', -- nuevo, contactado, cotizado, evaluacion, ganado, perdido, no_responde, en_espera
  type VARCHAR(30) NOT NULL DEFAULT 'nuevo', -- nuevo_cliente, antiguo_cliente
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
