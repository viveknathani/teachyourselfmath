import { Processor, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';

const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const createQueue = (queueName: string) => {
  return new Queue(queueName, {
    connection: redisConnection,
  });
};

const createWorker = (
  queueName: string,
  callback: Processor,
  options: WorkerOptions = {},
): Worker => {
  const worker = new Worker(queueName, callback, {
    connection: redisConnection,
    ...options,
  });
  worker.on('failed', (err) => {
    console.log(`🔴 ${queueName} worker failed`, err);
  });
  worker.on('completed', () => {
    console.log(`🟢 ${queueName} worker completed`);
  });
  return worker;
};

export { createWorker, createQueue };
