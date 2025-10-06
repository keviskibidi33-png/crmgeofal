-- =====================================================
-- CORREGIR USUARIOS DUPLICADOS - CRMGeoFal
-- =====================================================

-- Primero, agregar columnas si no existen
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear usernames únicos basados en name + id
UPDATE users SET 
    username = name || '_' || id,
    full_name = COALESCE(name || ' ' || COALESCE(apellido, ''), name),
    is_active = COALESCE(active, true)
WHERE username IS NULL;

-- Verificar que no hay duplicados
SELECT username, COUNT(*) as count
FROM users 
WHERE username IS NOT NULL
GROUP BY username 
HAVING COUNT(*) > 1;

-- Crear índices únicos solo si no hay duplicados
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email) WHERE email IS NOT NULL;

-- Hacer campos NOT NULL
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Actualizar roles
UPDATE users SET role = 'admin' WHERE role = 'jefa_comercial';
UPDATE users SET role = 'user' WHERE role = 'vendedor';
UPDATE users SET role = 'viewer' WHERE role = 'viewer';

-- Agregar restricción CHECK para roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
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

-- Verificar resultado
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as users_with_username,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as users_with_full_name
FROM users;
