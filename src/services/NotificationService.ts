import {
  AppState,
  NOTIFICATION_CHANNEL,
  SendNotificationRequest,
} from '../types';
import { sendEmail } from '../utils';

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
