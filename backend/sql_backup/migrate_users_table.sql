-- =====================================================
-- MIGRACIÓN DE TABLA USERS - CRMGeoFal
-- =====================================================
-- Este script migra la tabla users existente a la nueva estructura
-- =====================================================

-- Agregar columnas que faltan
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Migrar datos existentes
UPDATE users SET 
    username = COALESCE(name, 'user_' || id),
    full_name = COALESCE(name || ' ' || COALESCE(apellido, ''), name),
    is_active = COALESCE(active, true)
WHERE username IS NULL;

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email) WHERE email IS NOT NULL;

-- Hacer username NOT NULL después de migrar datos
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Actualizar roles existentes a los nuevos valores
UPDATE users SET role = 'admin' WHERE role = 'jefa_comercial';
UPDATE users SET role = 'user' WHERE role = 'vendedor';
UPDATE users SET role = 'viewer' WHERE role = 'viewer';

-- Agregar restricción CHECK para roles
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'viewer'));

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_users_updated_at();

-- Verificar migración
SELECT 
    'Migración de tabla users completada' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as users_with_username,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as users_with_full_name
FROM users;
