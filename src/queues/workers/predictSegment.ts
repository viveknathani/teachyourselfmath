import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, PredictSegmentJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { FileProcessorService } from '../../services/FileProcessorService';
import { addToDatabaseQueue } from './addToDatabase';
import { state } from '../../state';

const queueName = QUEUE_NAME.PREDICT_SEGMENT;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const fileProcessorService = FileProcessorService.getInstance();
  const { source, imageKey, tags } = job.data as PredictSegmentJobData;

  // Use the image key to get the image from cache
  const imageUrl = await getImageUrlFromImageKey(imageKey);
  if (!imageUrl) {
    throw new Error('imageUrl cannot be null!');
  }

  // Magic time, run the model!
  const { problems } =
    await fileProcessorService.extractProblemsFromImageUrl(imageUrl);
  if (!Array.isArray(problems)) {
    throw new Error(`problems is not an array!, ${JSON.stringify(problems)}`);
  }

  // Send to database
  await Promise.all(
    problems.map(async (problem: any) => {
      if (problem?.description && problem?.difficulty) {
        await addToDatabaseQueue({
          description: problem.description,
          difficulty: problem.difficulty,
          source: source.replace('.pdf', ''),
          tags: tags.split(','),
        });
      }
    }),
  );
});

const getImageUrlFromImageKey = async (key: string) => {
  return state.cache.get(key);
};

const addToPredictSegmentQueue = (
  data: PredictSegmentJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToPredictSegmentQueue };
