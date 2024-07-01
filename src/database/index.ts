import { Pool } from 'pg';
import { ExecuteQuery } from '../types';

const getDatabaseConnectionPool = (connectionString: string): Pool => {
  return new Pool({
    connectionString,
    max: 10,
  });
};

const executeQuery = async (request: ExecuteQuery) => {
  const client = await request.pool.connect();
  try {
    if (request?.transaction) {
      console.log('[database]: BEGIN');
      await client.query('BEGIN');
    }
    console.log(`[database]: ${request.text}`);
    const result = await client.query(request.text, request.values);
    if (request?.transaction) {
      console.log('[database]: COMMIT');
      await client.query('COMMIT');
    }
    return result;
  } catch (err) {
    if (request?.transaction) {
      console.log('[database]: ROLLBACK');
      await client.query('ROLLBACK');
    }
    throw err;
  } finally {
    client.release();
  }
};

const getDatabaseVersion = async (pool: Pool) => {
  const queryResponse = await executeQuery({
    pool,
    text: 'select version();',
  });
  return queryResponse.rows;
};

export { executeQuery, getDatabaseConnectionPool, getDatabaseVersion };
export * from './user';
export * from './problem';
export * from './comment';
export * from './vote';
