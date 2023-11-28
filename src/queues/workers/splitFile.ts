import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SplitFileJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToPredictSegmentQueue } from './predictSegment';
import { getSplits } from '../../utils';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'fs/promises';

const queueName = QUEUE_NAME.SPLIT_FILE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const SPLIT_SIZE = 2;
  const { file } = job.data as SplitFileJobData;
  const buffer = await readFile(file.path);
  const parsed = await PDFDocument.load(buffer);
  const numberOfPages = parsed.getPageCount();
  const splits = getSplits(numberOfPages, SPLIT_SIZE);
  await Promise.all(
    splits.map((split) =>
      addToPredictSegmentQueue({
        file,
        source: file.originalname,
        start: split.start,
        end: split.end,
      }),
    ),
  );
});

const addToSplitFileQueue = (
  data: SplitFileJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSplitFileQueue };
