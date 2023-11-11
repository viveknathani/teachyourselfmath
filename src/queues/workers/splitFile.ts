import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SplitFileJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToPredictSegmentQueue } from './predictSegment';

const queueName = QUEUE_NAME.SPLIT_FILE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as SplitFileJobData;
  console.log(`doing some cool job for splitting the file ${job.id}`);
  await addToPredictSegmentQueue({
    file: data.file,
  });
});

const addToSplitFileQueue = (
  data: SplitFileJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSplitFileQueue };
