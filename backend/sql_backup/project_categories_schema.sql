-- Tabla de categorías de proyectos
CREATE TABLE IF NOT EXISTS project_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_categories_name ON project_categories (LOWER(name));

COMMENT ON TABLE project_categories IS 'Categorías de proyectos del sistema';

-- Tabla de subcategorías de proyectos
CREATE TABLE IF NOT EXISTS project_subcategories (
  id SERIAL PRIMARY KEY,
  project_category_id INTEGER NOT NULL REFERENCES project_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_project_subcategories_category_name ON project_subcategories (project_category_id, LOWER(name));

COMMENT ON TABLE project_subcategories IS 'Subcategorías de proyectos del sistema';
