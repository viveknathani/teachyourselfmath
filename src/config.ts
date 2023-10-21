import dotenv from 'dotenv';
import { SERVER_ENVIRONMENT } from './types';
dotenv.config();

export default {
  ENVIRONMENT: process.env.ENVIRONMENT || SERVER_ENVIRONMENT.DEV,
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || '8080',
};
