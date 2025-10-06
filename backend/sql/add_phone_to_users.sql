-- Agregar campo phone a la tabla users
-- Ejecutar este script para agregar el campo teléfono a los usuarios

-- Verificar si la columna ya existe
DO $$
BEGIN
    -- Agregar columna phone si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Columna phone agregada a la tabla users';
    ELSE
        RAISE NOTICE 'La columna phone ya existe en la tabla users';
    END IF;
END $$;

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
