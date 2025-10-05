import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

async function reset() {
  console.log('🗑️  Dropping existing schema...');

  try {
    // Drop tables if they exist
    await pool.query('DROP TABLE IF EXISTS sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // Drop enum type if it exists
    await pool.query('DROP TYPE IF EXISTS role CASCADE');

    console.log('✅ Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error during reset:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

reset();
