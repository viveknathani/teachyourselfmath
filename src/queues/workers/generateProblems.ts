import { JobsOptions } from 'bullmq';
import { GenerateProblemsJobData, QUEUE_NAME } from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.GENERATE_PROBLEMS;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async () => {
  console.log('HELLO');
});

const addToGenerateProblemsQueue = (
  data: GenerateProblemsJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

const getGenerateProblemsJobId = (configurationId: number, userId: number) => {
  return `DIGEST:${configurationId}:${userId}`;
};

export { queue, worker, addToGenerateProblemsQueue, getGenerateProblemsJobId };
