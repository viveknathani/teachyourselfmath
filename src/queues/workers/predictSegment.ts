import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, PredictSegmentJobData } from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.PREDICT_SEGMENT;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as PredictSegmentJobData;
  if (!data.imageBuffer) {
    throw new Error('image buffer cannot be null!');
  }
});

const addToPredictSegmentQueue = (
  data: PredictSegmentJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToPredictSegmentQueue };
