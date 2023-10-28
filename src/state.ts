import { getCacheConnection } from './cache';
import config from './config';
import { getDatabaseConnectionPool } from './database';
import { AppState } from './types';

export const state: AppState = {
  databasePool: getDatabaseConnectionPool(config.DATABASE_URL),
  cache: getCacheConnection(config.REDIS_URL),
};
