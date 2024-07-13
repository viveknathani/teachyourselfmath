import { Job, JobsOptions } from 'bullmq';
import { state } from '../../state';
import {
  NOTIFICATION_CHANNEL,
  QUEUE_NAME,
  StoreProblemsJobData,
} from '../../types';
import { createQueue, createWorker } from '../factory';
import { UserConfigurationService } from '../../services/UserConfigurationService';
import { addToSendNotificationQueue } from './sendNotification';
import { UserService } from '../../services/UserService';
import config from '../../config';

const queueName = QUEUE_NAME.STORE_PROBLEMS;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const userConfigurationService = UserConfigurationService.getInstance(state);
  const userService = UserService.getInstance(state);
  const data = job.data as StoreProblemsJobData;
  const digest = await userConfigurationService.createDigest(
    data.configurationId,
  );
  await userConfigurationService.storeProblems(
    digest.id,
    data.configurationId,
    data.problemIds,
  );
  const user = await userService.getProfile(data.userId);
  await addToSendNotificationQueue({
    channel: NOTIFICATION_CHANNEL.EMAIL,
    user: {
      type: 'email',
      data: user.email,
    },
    payload: {
      subject: `Here is your digest, ${user.name}!`,
      body: `<a href="${config.HOST}/digests/${digest.id}">Link</a>`,
    },
  });
});

const addToStoreProblemsQueue = (
  data: StoreProblemsJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToStoreProblemsQueue };
