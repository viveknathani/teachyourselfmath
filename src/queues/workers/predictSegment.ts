import { Job, JobsOptions } from 'bullmq';
import config from '../../config';
import { QUEUE_NAME, PredictSegmentJobData } from '../../types';
import { createQueue, createWorker } from '../factory';
import { addToSplitPredictionQueue } from './splitPrediction';
import { readFile } from 'fs/promises';
import axios from 'axios';

const queueName = QUEUE_NAME.PREDICT_SEGMENT;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as PredictSegmentJobData;
  const text = await runModel(data.file.path, data.start, data.end);
  await addToSplitPredictionQueue({
    text,
    source: data.source,
  });
});

const addToPredictSegmentQueue = (
  data: PredictSegmentJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

const runModel = async (
  filePath: string,
  start: number,
  stop: number,
): Promise<string> => {
  const formData = new FormData();
  const buffer = await readFile(filePath);
  formData.set('file', new Blob([buffer]));
  const response = await axios.post(
    `${config.MODEL_URL}/predict?start=${start}&stop=${stop}`,
    formData,
    {
      headers: {
        'Content-Type': 'application/pdf',
      },
    },
  );
  return response.data;
};

export { queue, worker, addToPredictSegmentQueue };
