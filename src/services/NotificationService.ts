import {
  AppState,
  NOTIFICATION_CHANNEL,
  REDIS_KEY_PREFIX,
  SendNotificationRequest,
} from '../types';
import { TIME_IN_SECONDS, sendEmail } from '../utils';

export class NotificationService {
  private static instance: NotificationService;
  private state: AppState;
  private constructor(state: AppState) {
    this.state = state;
  }

  public static getInstance(state: AppState): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(state);
    }
    return NotificationService.instance;
  }

  public async sendNotification(request: SendNotificationRequest) {
    switch (request.channel) {
      case NOTIFICATION_CHANNEL.EMAIL: {
        const key = `${REDIS_KEY_PREFIX.EMAIL_LIMIT}:${request.user.data}`;
        const count = await this.state.cache.get(key);
        if (!count) {
          await this.state.cache.set(key, 1, 'EX', TIME_IN_SECONDS.ONE_HOUR);
        } else if (JSON.parse(count) >= 5) {
          throw new Error('max limit reached!');
        } else {
          await this.state.cache.incr(key);
        }
        await sendEmail({
          from: 'vivek@teachyourselfmath.app',
          to: request.user.data,
          subject: request.payload.subject,
          html: request.payload.body,
        });
        break;
      }
      default: {
        throw new Error('unsupported channel!');
      }
    }
  }
}
