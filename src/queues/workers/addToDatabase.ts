import { Job, JobsOptions } from 'bullmq';
import { ProblemService } from '../../services/ProblemService';
import { state } from '../../state';
import {
  AddToDatabaseJobData,
  PROBLEM_DIFFICULTY,
  QUEUE_NAME,
} from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.ADD_TO_DATABASE;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const problemService = ProblemService.getInstance(state);
  const data = job.data as AddToDatabaseJobData;
  await problemService.insertProblem({
    description: data.sanitisedPrediction,
    title: data.sanitisedPrediction.slice(0, 20),
    source: data.source,
    tagsToAttachWhileInserting: data.tags,
    difficulty: PROBLEM_DIFFICULTY.EASY,
  });
});

const addToDatabaseQueue = (
  data: AddToDatabaseJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToDatabaseQueue };
