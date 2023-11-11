import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, RemoveJunkJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToDatabaseQueue } from './addToDatabase';

const queueName = QUEUE_NAME.REMOVE_JUNK;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  console.log(`doing some cool job for removing junk ${job.id}`);
  await addToDatabaseQueue({
    sanitisedPrediction: {},
  });
});

const addToRemoveJunkQueue = (
  data: RemoveJunkJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToRemoveJunkQueue };
