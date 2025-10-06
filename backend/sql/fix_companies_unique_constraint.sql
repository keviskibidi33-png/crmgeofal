-- Corregir restricción UNIQUE en tabla companies para permitir múltiples NULL
-- Esto es necesario para personas naturales que no tienen RUC

-- Eliminar la restricción UNIQUE existente
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_ruc_key;

-- Crear una restricción UNIQUE parcial que solo aplique a valores no-null
CREATE UNIQUE INDEX companies_ruc_unique_idx ON companies (ruc) WHERE ruc IS NOT NULL;

-- También crear un índice único para DNI cuando no sea null
CREATE UNIQUE INDEX companies_dni_unique_idx ON companies (dni) WHERE dni IS NOT NULL;
