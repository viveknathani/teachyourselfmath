import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, SendNotificationRequest } from '../../types';
import { createQueue, createWorker } from '../factory';
import { NotificationService } from '../../services/NotificationService';
import { state } from '../../state';

const queueName = QUEUE_NAME.SEND_NOTIFICATION;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as SendNotificationRequest;
  const notificationService = NotificationService.getInstance(state);
  await notificationService.sendNotification(data);
});

const addToSendNotificationQueue = (
  data: SendNotificationRequest,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

export { queue, worker, addToSendNotificationQueue };
