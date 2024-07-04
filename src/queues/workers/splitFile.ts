import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SplitFileJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToPredictSegmentQueue } from './predictSegment';
import pdf2pic from 'pdf2pic';
import { readFile } from 'fs/promises';

const queueName = QUEUE_NAME.SPLIT_FILE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const CONVERT_ALL_PAGES = -1;
  const { file, tags } = job.data as SplitFileJobData;
  const buffer = await readFile(file.path);
  const converter = pdf2pic.fromBuffer(buffer, {
    format: 'png',
    width: 600,
    height: 400,
  });
  const images = await converter.bulk(CONVERT_ALL_PAGES, {
    responseType: 'buffer',
  });
  await Promise.all(
    images.map((image) =>
      addToPredictSegmentQueue({
        source: file.originalname,
        imageBuffer: image?.buffer || null,
        tags,
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
