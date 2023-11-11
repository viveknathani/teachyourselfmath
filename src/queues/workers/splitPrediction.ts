import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SplitPredictionJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToRemoveJunkQueue } from './removeJunk';

const queueName = QUEUE_NAME.SPLIT_PREDICTION;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  console.log(`doing some cool job for splitting the prediction ${job.id}`);
  await addToRemoveJunkQueue({
    splittedPrediciton: {},
  });
});

const addToSplitPredictionQueue = (
  data: SplitPredictionJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSplitPredictionQueue };
