import { Redis } from 'ioredis';

const getCacheConnection = (connectionString: string) => {
  return new Redis(connectionString);
};

export { getCacheConnection };
