import dotenv from 'dotenv';
import { SERVER_ENVIRONMENT } from './types';
dotenv.config();

export default {
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  ENVIRONMENT: process.env.ENVIRONMENT || SERVER_ENVIRONMENT.DEV,
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || '8080',
  JWT_SECRET: process.env.JWT_SECRET || '',
  TYM_API_KEY: process.env.TYM_API_KEY || '',
  MODEL_URL: process.env.MODEL_URL || '',
  MAX_FILE_SIZE_IN_BYTES: 30_000_000,
  BCRYPT_NUMBER_OF_ROUNDS: 10,
  POSTMARK_API_KEY: process.env.POSTMARK_API_KEY || '',
};
