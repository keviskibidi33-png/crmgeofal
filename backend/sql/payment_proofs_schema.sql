-- Tabla para comprobantes de pago
CREATE TABLE IF NOT EXISTS payment_proofs (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    description TEXT,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approval_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_payment_proofs_quote_id ON payment_proofs(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_uploaded_by ON payment_proofs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_approved_by ON payment_proofs(approved_by);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_date ON payment_proofs(payment_date);

-- Función para actualizar `updated_at` automáticamente
CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para payment_proofs
DROP TRIGGER IF EXISTS update_payment_proofs_updated_at ON payment_proofs;
CREATE TRIGGER update_payment_proofs_updated_at
BEFORE UPDATE ON payment_proofs
FOR EACH ROW
EXECUTE FUNCTION update_payment_proofs_updated_at();

-- Añadir columna `payment_status` a la tabla `quotes` si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotes' AND column_name='payment_status') THEN
        ALTER TABLE quotes ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pendiente';
    END IF;
END $$;

-- Añadir columna `payment_date` a la tabla `quotes` si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotes' AND column_name='payment_date') THEN
        ALTER TABLE quotes ADD COLUMN payment_date DATE;
    END IF;
END $$;

-- Añadir columna `payment_method` a la tabla `quotes` si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotes' AND column_name='payment_method') THEN
        ALTER TABLE quotes ADD COLUMN payment_method VARCHAR(100);
    END IF;
END $$;

-- Añadir columna `payment_amount` a la tabla `quotes` si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotes' AND column_name='payment_amount') THEN
        ALTER TABLE quotes ADD COLUMN payment_amount NUMERIC(10, 2);
    END IF;
END $$;
