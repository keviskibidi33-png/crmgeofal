const pool = require('../config/db');

async function runMigration() {
  try {
    console.log('🔄 Running database migration to add missing columns...');
    
    // Check and add priority column
    const priorityResult = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'priority'
    `);
    
    if (priorityResult.rows.length === 0) {
      await pool.query("ALTER TABLE projects ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'");
      console.log('✅ Added priority column to projects table');
    } else {
      console.log('ℹ️ Priority column already exists in projects table');
    }
    
    // Check and add status column
    const statusResult = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'status'
    `);
    
    if (statusResult.rows.length === 0) {
      await pool.query("ALTER TABLE projects ADD COLUMN status VARCHAR(50) DEFAULT 'pendiente'");
      console.log('✅ Added status column to projects table');
    } else {
      console.log('ℹ️ Status column already exists in projects table');
    }
    
    // Check and add updated_at column
    const updatedAtResult = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'updated_at'
    `);
    
    if (updatedAtResult.rows.length === 0) {
      await pool.query("ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()");
      console.log('✅ Added updated_at column to projects table');
    } else {
      console.log('ℹ️ Updated_at column already exists in projects table');
    }
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
