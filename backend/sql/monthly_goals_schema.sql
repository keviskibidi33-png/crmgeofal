-- Tabla para metas mensuales
CREATE TABLE IF NOT EXISTS monthly_goals (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    goal_quantity INTEGER NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(year, month)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_monthly_goals_year_month ON monthly_goals(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_created_by ON monthly_goals(created_by);

-- Comentarios
COMMENT ON TABLE monthly_goals IS 'Metas mensuales de ventas configuradas por el jefe comercial';
COMMENT ON COLUMN monthly_goals.year IS 'Año de la meta';
COMMENT ON COLUMN monthly_goals.month IS 'Mes de la meta (1-12)';
COMMENT ON COLUMN monthly_goals.goal_quantity IS 'Cantidad de ventas objetivo para el mes';
COMMENT ON COLUMN monthly_goals.created_by IS 'Usuario que creó la meta';
COMMENT ON COLUMN monthly_goals.updated_by IS 'Usuario que actualizó la meta por última vez';
