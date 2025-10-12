-- Agregar columnas faltantes a la tabla projects
ALTER TABLE projects
ADD COLUMN queries TEXT,
ADD COLUMN requiere_laboratorio BOOLEAN DEFAULT false,
ADD COLUMN requiere_ingenieria BOOLEAN DEFAULT false,
ADD COLUMN requiere_consultoria BOOLEAN DEFAULT false,
ADD COLUMN requiere_capacitacion BOOLEAN DEFAULT false,
ADD COLUMN requiere_auditoria BOOLEAN DEFAULT false,
ADD COLUMN laboratorio_status VARCHAR(50) DEFAULT 'pendiente',
ADD COLUMN ingenieria_status VARCHAR(50) DEFAULT 'pendiente',
ADD COLUMN contact_name VARCHAR(255),
ADD COLUMN contact_phone VARCHAR(50),
ADD COLUMN contact_email VARCHAR(255),
ADD COLUMN marked BOOLEAN DEFAULT false;
