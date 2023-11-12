import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SplitPredictionJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToRemoveJunkQueue } from './removeJunk';

const queueName = QUEUE_NAME.SPLIT_PREDICTION;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as SplitPredictionJobData;
  const parts = data.text.split('\n');
  await Promise.all(
    parts.map((part) => {
      addToRemoveJunkQueue({
        prediction: part,
        source: data.source,
      });
    }),
  );
});

const addToSplitPredictionQueue = (
  data: SplitPredictionJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSplitPredictionQueue };
