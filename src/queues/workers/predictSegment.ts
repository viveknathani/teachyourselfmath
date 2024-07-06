import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, PredictSegmentJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { FileProcessorService } from '../../services/FileProcessorService';
import { addToDatabaseQueue } from './addToDatabase';

const queueName = QUEUE_NAME.PREDICT_SEGMENT;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const fileProcessorService = FileProcessorService.getInstance();
  const { source, image, tags } = job.data as PredictSegmentJobData;
  const { problems } =
    await fileProcessorService.extractProblemsFromImageBuffer(
      image.buffer,
      image.format,
    );
  if (!Array.isArray(problems)) {
    throw new Error(`problems is not an array!, ${JSON.stringify(problems)}`);
  }
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

const addToPredictSegmentQueue = (
  data: PredictSegmentJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToPredictSegmentQueue };
