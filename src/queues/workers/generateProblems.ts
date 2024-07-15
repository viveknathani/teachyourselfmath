import { Job, JobsOptions } from 'bullmq';
import {
  GenerateProblemsJobData,
  PROBLEM_DIFFICULTY,
  QUEUE_NAME,
} from '../../types';
import { createQueue, createWorker } from '../factory';
import { UserConfigurationService } from '../../services/UserConfigurationService';
import { state } from '../../state';
import { addToStoreProblemsQueue } from './storeProblems';

const queueName = QUEUE_NAME.GENERATE_PROBLEMS;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const userConfigurationService = UserConfigurationService.getInstance(state);

  const data = job.data as GenerateProblemsJobData;
  const userConfiguration =
    await userConfigurationService.getConfigurationByIdAndUserId(
      data.configurationId,
      data.userId,
    );
  if (!userConfiguration) {
    return;
  }

  const promises = [];

  if (userConfiguration.countEasy > 0) {
    promises.push(
      userConfigurationService.getDigestProblems(
        userConfiguration.tags,
        PROBLEM_DIFFICULTY.EASY,
        userConfiguration.id,
        userConfiguration.countEasy,
      ),
    );
  }

  if (userConfiguration.countMedium > 0) {
    promises.push(
      userConfigurationService.getDigestProblems(
        userConfiguration.tags,
        PROBLEM_DIFFICULTY.MEDIUM,
        userConfiguration.id,
        userConfiguration.countMedium,
      ),
    );
  }

  if (userConfiguration.countHard > 0) {
    promises.push(
      userConfigurationService.getDigestProblems(
        userConfiguration.tags,
        PROBLEM_DIFFICULTY.MEDIUM,
        userConfiguration.id,
        userConfiguration.countHard,
      ),
    );
  }

  const problemIds: number[] = [];
  const allPromises = await Promise.all(promises);
  allPromises.forEach((operation) => problemIds.push(...operation));

  await addToStoreProblemsQueue({
    configurationId: data.configurationId,
    userId: data.userId,
    problemIds,
  });
});

const addToGenerateProblemsQueue = (
  data: GenerateProblemsJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

const getGenerateProblemsJobId = (configurationId: number, userId: number) => {
  return `DIGEST:${configurationId}:${userId}`;
};

export { queue, worker, addToGenerateProblemsQueue, getGenerateProblemsJobId };
