-- Migración para actualizar la tabla export_history
-- Agregar nuevas columnas si no existen

-- Agregar columna client_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'export_history' AND column_name = 'client_id') THEN
        ALTER TABLE export_history ADD COLUMN client_id INTEGER REFERENCES companies(id);
    END IF;
END $$;

-- Agregar columna project_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'export_history' AND column_name = 'project_id') THEN
        ALTER TABLE export_history ADD COLUMN project_id INTEGER REFERENCES projects(id);
    END IF;
END $$;

-- Agregar columna commercial_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'export_history' AND column_name = 'commercial_id') THEN
        ALTER TABLE export_history ADD COLUMN commercial_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Agregar columna laboratory_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'export_history' AND column_name = 'laboratory_id') THEN
        ALTER TABLE export_history ADD COLUMN laboratory_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- Agregar columna status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'export_history' AND column_name = 'status') THEN
        ALTER TABLE export_history ADD COLUMN status VARCHAR(20) DEFAULT 'nuevo';
    END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_export_history_client_id ON export_history(client_id);
CREATE INDEX IF NOT EXISTS idx_export_history_project_id ON export_history(project_id);
CREATE INDEX IF NOT EXISTS idx_export_history_status ON export_history(status);
