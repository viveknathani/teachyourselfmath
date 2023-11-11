import { Job, JobsOptions } from 'bullmq';
import { AddToDatabaseJobData, QUEUE_NAME } from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.ADD_TO_DATABASE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  console.log(`doing some cool job for adding to database ${job.id}`);
});

const addToDatabaseQueue = (
  data: AddToDatabaseJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToDatabaseQueue };
