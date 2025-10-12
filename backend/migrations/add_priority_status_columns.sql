-- Migration to add missing columns to projects table
-- Date: 2025-10-12

-- Add priority column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
        ALTER TABLE projects ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE 'Added priority column to projects table';
    ELSE
        RAISE NOTICE 'Priority column already exists in projects table';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'pendiente';
        RAISE NOTICE 'Added status column to projects table';
    ELSE
        RAISE NOTICE 'Status column already exists in projects table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to projects table';
    ELSE
        RAISE NOTICE 'Updated_at column already exists in projects table';
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN projects.priority IS 'Priority level: normal, high, urgent';
COMMENT ON COLUMN projects.status IS 'Project status: pendiente, activo, en_proceso, completado, pausado, cancelado';
COMMENT ON COLUMN projects.updated_at IS 'Timestamp of last update';
