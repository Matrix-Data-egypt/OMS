
import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});
