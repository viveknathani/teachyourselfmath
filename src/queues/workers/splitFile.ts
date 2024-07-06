import { Job, JobsOptions } from 'bullmq';
import {
  IMAGE_FORMAT,
  QUEUE_NAME,
  REDIS_KEY_PREFIX,
  SplitFileJobData,
} from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToPredictSegmentQueue } from './predictSegment';
import pdf2pic from 'pdf2pic';
import { readFile } from 'fs/promises';
import { state } from '../../state';
import { BufferResponse } from 'pdf2pic/dist/types/convertResponse';
import { getBase64ImageUrlFromBuffer } from '../../utils';

const queueName = QUEUE_NAME.SPLIT_FILE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const CONVERT_ALL_PAGES = -1;
  const { file, tags } = job.data as SplitFileJobData;
  const buffer = await readFile(file.path);
  const source = file.originalname;

  // Initialise converter
  const converter = pdf2pic.fromBuffer(buffer, {
    format: IMAGE_FORMAT.PNG,
    width: 600,
    height: 400,
  });

  // Convert all pages of the PDF to images
  const images = await converter.bulk(CONVERT_ALL_PAGES, {
    responseType: 'buffer',
  });

  await Promise.all(
    images.map(async (image) => {
      if (image.buffer) {
        const cacheKey = await storeImageInCacheAndReturnKey(
          image,
          IMAGE_FORMAT.PNG,
          source,
        );
        await addToPredictSegmentQueue({
          source: source,
          imageKey: cacheKey,
          tags,
        });
      }
    }),
  );
});

const storeImageInCacheAndReturnKey = async (
  image: BufferResponse,
  imageFormat: IMAGE_FORMAT,
  source: string,
) => {
  if (!image.buffer || !image.page) {
    throw new Error('image buffer or page cannot be null');
  }

  const cacheKey = `${REDIS_KEY_PREFIX.IMAGES}:${source}:${image.page}`;
  const url = getBase64ImageUrlFromBuffer(image.buffer, imageFormat);

  await state.cache.set(cacheKey, url);
  return cacheKey;
};

const addToSplitFileQueue = (
  data: SplitFileJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSplitFileQueue };
