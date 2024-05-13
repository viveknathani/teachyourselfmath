import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { queue as SplitFileQueue } from './workers/splitFile';
import { queue as PredictSegmentQueue } from './workers/predictSegment';
import { queue as SplitPredictionQueue } from './workers/splitPrediction';
import { queue as RemoveJunkQueue } from './workers/removeJunk';
import { queue as AddToDatabaseQueue } from './workers/addToDatabase';
import { queue as SendNotificationQueue } from './workers/sendNotification';

const queues = [
  new BullMQAdapter(SplitFileQueue),
  new BullMQAdapter(PredictSegmentQueue),
  new BullMQAdapter(SplitPredictionQueue),
  new BullMQAdapter(RemoveJunkQueue),
  new BullMQAdapter(AddToDatabaseQueue),
  new BullMQAdapter(SendNotificationQueue),
];

const createDashboardAndGetRouter = () => {
  const adapter = new ExpressAdapter();
  adapter.setBasePath('/admin/queues');
  createBullBoard({
    queues,
    serverAdapter: adapter,
  });
  return adapter.getRouter();
};

export { createDashboardAndGetRouter };
