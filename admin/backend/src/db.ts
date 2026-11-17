import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aliahmeDali123@@127.0.0.1:5432/oms_invoice_db',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client in admin backend:', err);
});
