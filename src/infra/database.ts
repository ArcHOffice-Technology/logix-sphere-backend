
import { Pool } from 'pg';
import { environment } from '../config/environment';

export const pool = new Pool({
  host: environment.dbHost,
  port: environment.dbPort,
  user: environment.dbUser,
  password: environment.dbPassword,
  database: environment.dbName,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

export const queryWithLog = async (queryText: string, params: any[] = []) => {
  console.log('Executing query:', queryText);
  const start = Date.now();
  const res = await pool.query(queryText, params);
  const duration = Date.now() - start;
  console.log('Query executed in:', duration, 'ms');
  return res;
};
