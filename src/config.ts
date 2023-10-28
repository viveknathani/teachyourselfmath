import dotenv from 'dotenv';
import { SERVER_ENVIRONMENT } from './types';
dotenv.config();

export default {
  DATABASE_URL: process.env.DATABASE_URL || '',
  ENVIRONMENT: process.env.ENVIRONMENT || SERVER_ENVIRONMENT.DEV,
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || '8080',
};
