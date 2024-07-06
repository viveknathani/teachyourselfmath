import { Job, JobsOptions } from 'bullmq';
import { ProblemService } from '../../services/ProblemService';
import { state } from '../../state';
import { AddToDatabaseJobData, PROBLEM_STATUS, QUEUE_NAME } from '../../types';
import { createQueue, createWorker } from '../factory';

const queueName = QUEUE_NAME.ADD_TO_DATABASE;

const queue = createQueue(queueName);

const MAX_TITLE_LENGTH = 150;

const worker = createWorker(queueName, async (job: Job) => {
  const problemService = ProblemService.getInstance(state);
  const data = job.data as AddToDatabaseJobData;

  await problemService.insertProblem({
    description: data.description,
    title: getTitleFromDescription(data.description),
    source: data.source,
    tagsToAttachWhileInserting: data.tags,
    difficulty: data.difficulty,
    status: PROBLEM_STATUS.DRAFT,
  });
});

const getTitleFromDescription = (description: string) => {
  return description.length > MAX_TITLE_LENGTH
    ? `${description.slice(0, MAX_TITLE_LENGTH)}...`
    : description;
};

const addToDatabaseQueue = (
  data: AddToDatabaseJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToDatabaseQueue };
