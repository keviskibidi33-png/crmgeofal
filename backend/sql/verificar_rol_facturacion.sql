-- Script para agregar rol de facturación si no existe
-- Este script es seguro para ejecutar múltiples veces

-- Verificar si ya existe el rol en la tabla users
DO $$
BEGIN
    -- Verificar si existe la columna role y si permite el valor 'facturacion'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        -- Si no hay restricciones de CHECK, probablemente es un VARCHAR libre
        RAISE NOTICE 'Campo role en users no tiene restricciones CHECK. El valor "facturacion" debería ser válido.';
    END IF;
    
    -- Verificar si hay algún usuario con rol facturacion
    IF EXISTS (SELECT 1 FROM users WHERE role = 'facturacion') THEN
        RAISE NOTICE 'Ya existen usuarios con rol "facturacion" en la base de datos.';
    ELSE
        RAISE NOTICE 'No hay usuarios con rol "facturacion" en la base de datos.';
    END IF;
    
END $$;

-- Mostrar información actual de roles
SELECT 
    role,
    COUNT(*) as cantidad_usuarios,
    array_agg(name) as nombres_usuarios
FROM users 
GROUP BY role 
ORDER BY role;

-- Ejemplo de cómo crear un usuario con rol facturación (comentado por seguridad)
/*
INSERT INTO users (name, apellido, email, password, role, area, active, created_at)
VALUES (
    'Usuario',
    'Facturación',
    'facturacion@geofal.com',
    '$2b$10$hashedpassword', -- Cambiar por password hasheado real
    'facturacion',
    'Facturación',
    true,
    NOW()
);
*/