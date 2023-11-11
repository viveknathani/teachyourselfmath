import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, PredictSegmentJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToSplitPredictionQueue } from './splitPrediction';

const queueName = QUEUE_NAME.PREDICT_SEGMENT;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  console.log(`doing some cool job for predicting ${job.id}`);
  await addToSplitPredictionQueue({
    prediction: {},
  });
});

const addToPredictSegmentQueue = (
  data: PredictSegmentJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToPredictSegmentQueue };
