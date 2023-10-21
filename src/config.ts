import dotenv from 'dotenv';
dotenv.config();

export default {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || '8080',
};
